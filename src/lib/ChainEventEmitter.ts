import { EventEmitter } from 'events';

import { ANY_EVENT, errors } from '../constants';
import { makeGenerator } from '../helpers';
import {ChainEventEmitterError, ChainEventEmitterEventHandlerError, ChainEventEmitterEventNameError} from '../errors';
import {
  ChainEventEmitterOptions,
  Logger,
  TChainEventErrorHandler,
  TChainEventHandler
} from '../options';

export class ChainEventEmitter {

  private readonly context: any;
  private logger: Logger
  private eventEmitter: EventEmitter;
  private eventHandlers: Map<string, TChainEventHandler[]>;
  private eventHandlerStatus: Map<string, boolean>;
  private eventErrorHandlers: Map<string, TChainEventErrorHandler>;
  private anyEventHandlers: TChainEventHandler[];

  constructor(options?: ChainEventEmitterOptions) {
    const self = this;
    const chainEventEmitterOptions: ChainEventEmitterOptions = Object.assign({
      eventEmitter: new EventEmitter(),
      context: self,
      logger: console
    }, options);
    this.logger = chainEventEmitterOptions.logger;
    this.eventEmitter = chainEventEmitterOptions.eventEmitter;
    this.context = chainEventEmitterOptions.context;
    this.eventHandlerStatus = new Map<string, boolean>();
    this.eventHandlers = new Map<string, TChainEventHandler[]>();
    this.anyEventHandlers = [];
    this.eventErrorHandlers = new Map<string, TChainEventErrorHandler>();
  }

  public on(event: string, ...eventHandlers: TChainEventHandler[]): void {
    this.checkEventName(event);
    eventHandlers.forEach((handler: TChainEventHandler|TChainEventErrorHandler) => {
      this.checkEventHandler(handler);
    });
    if ( event === ANY_EVENT ) {
      this.anyEventHandlers.push(...eventHandlers);
    } else {
      if ( ! this.eventHandlers.has(event) ) {
        this.eventHandlers.set(event,[]);
      }
      this.eventHandlers.get(event).push(...eventHandlers);
    }
    this.eventEmitter.removeAllListeners(event);
    if ( !this.eventHandlerStatus.has(event) ) {
      this.eventHandlerStatus.set(event, true);
    }
    this.eventEmitter.on(event, this.handleEvent(event));
  }

  public onError(event: string, handler: TChainEventErrorHandler): void {
    this.checkEventName(event);
    this.checkEventHandler(handler);
    this.eventErrorHandlers.set(event, handler);
  }

  public off(event: string): void {
    this.checkEventName(event);
    if ( this.eventHandlers.has(event) ) {
      this.eventHandlers.delete(event);
      this.eventHandlerStatus.delete(event);
      this.eventEmitter.removeAllListeners(event);
    }
  }

  public disable(event: string) {
    if ( this.eventHandlerStatus.has(event) ) {
      this.eventHandlerStatus.set(event, false);
    }
  }

  public enable(event: string) {
    if ( this.eventHandlerStatus.has(event) ) {
      this.eventHandlerStatus.set(event, true);
    }
  }

  emit(event: string, data: any): void {
    this.checkEventName(event);
    this.eventEmitter.emit(event, data)
  }

  protected getErrorHandler(event: string): TChainEventErrorHandler {
    if ( ! this.eventErrorHandlers.has(event) ) {
      event = ANY_EVENT
    }
    return this.eventErrorHandlers.get(event);
  }

  protected checkEventName(event: string) {
    if ( typeof event !== 'string' || !event ) {
      throw new ChainEventEmitterEventNameError();
    }
  }

  protected checkEventHandler(handler: TChainEventErrorHandler|TChainEventHandler) {
    if ( typeof handler !== 'function') {
      throw new ChainEventEmitterEventHandlerError();
    }
  }

  protected handleEvent(event: string) {
    const self = this;
    const eventHandlers = [...this.anyEventHandlers, ...(this.eventHandlers.get(event)||[])];
    const generator = makeGenerator(eventHandlers);
    return function(data: any) {
      const executor = async () => {
        const eventHandler = generator.next();
        if ( eventHandler.value ) {
          await eventHandler.value.apply(self.context || this, [data, event, next]);
        }
      }
      const errorHandler = async (error: Error) => {
        try {
          const eventErrorHandler: TChainEventErrorHandler = self.getErrorHandler(event);
          if ( !eventErrorHandler ) {
            throw new ChainEventEmitterError(errors.errorHandlerIsAbsent(event))
          }
          await eventErrorHandler(error, data, event)
        } catch(e) {
          if ( e instanceof ChainEventEmitterError ) {
            self.logger.error(e.message);
          } else {
            throw e;
          }
        }
      }
      const next = () => {
        executor().catch(errorHandler)
      };
      const isEventEnabled: boolean = self.eventHandlerStatus.get(event);
      if ( isEventEnabled ) {
        next();
      }
    }
  }

}
