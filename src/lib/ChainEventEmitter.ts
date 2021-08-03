import { EventEmitter } from 'events';

import { ANY_EVENT, errors } from '../constants';
import { makeGenerator } from '../helpers';
import {
  ChainEventEmitterError,
  ChainEventEmitterEventHandlerError,
  ChainEventEmitterEventNameError
} from '../errors';
import {
  ChainEventEmitterOptions, EventConfiguration,
  Logger,
  TChainEventErrorHandler,
  TChainEventHandler
} from '../options';

export class ChainEventEmitter {

  private readonly context: any;
  private logger: Logger
  private eventEmitter: EventEmitter;
  private events: Map<string, EventConfiguration>;

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
    this.events = new Map<string, EventConfiguration>();
  }

  public on(event: string, ...eventHandlers: TChainEventHandler[]): void {
    this.checkEventName(event);
    eventHandlers.forEach((handler: TChainEventHandler|TChainEventErrorHandler) => {
      this.checkEventHandler(handler);
    });
    if ( !this.events.has(event) ) {
      this.events.set(event, {
        status: true,
        handlers: [],
      })
    }
    this.events.get(event).handlers.push(...eventHandlers);
    this.eventEmitter.removeAllListeners(event);
    this.eventEmitter.on(event, this.handleEvent(event));
  }

  public onError(event: string, errorHandler: TChainEventErrorHandler): void {
    this.checkEventName(event);
    this.checkEventHandler(errorHandler);
    if ( !this.events.has(event) ) {
      this.events.set(event, {
        status: true,
        handlers:[],
      });
    }
    this.events.get(event).errorHandler = errorHandler;
  }

  public off(event: string): void {
    this.checkEventName(event);
    if ( this.events.has(event) ) {
      this.events.delete(event);
      this.eventEmitter.removeAllListeners(event);
    }
  }

  public disable(event: string) {
    this.checkEventName(event);
    if ( this.events.has(event) ) {
      this.events.get(event).status = false;
    }
  }

  public enable(event: string) {
    this.checkEventName(event);
    if ( this.events.has(event) ) {
      this.events.get(event).status = true;
    }
  }

  emit(event: string, data: any): void {
    this.checkEventName(event);
    if ( event !== ANY_EVENT ) {
      this.eventEmitter.emit(event, data)
    }
  }

  protected getErrorHandler(event: string): TChainEventErrorHandler {
    if ( ! this.events.has(event) ) {
      event = ANY_EVENT
    }
    return this.events.get(event).errorHandler;
  }

  protected checkEventName(event: string) {
    if ( typeof event !== 'string' || !event.trim() ) {
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
    const anyEventHandlers = this.events.has(ANY_EVENT) ? this.events.get(ANY_EVENT).handlers : [];
    const eventOwnHandlers = this.events.has(event) ? this.events.get(event).handlers : [];
    const eventHandlers = [...anyEventHandlers, ...eventOwnHandlers];
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
      const isEventEnabled: boolean = self.events.has(event) && self.events.get(event).status;
      if ( isEventEnabled ) {
        next();
      }
    }
  }

}
