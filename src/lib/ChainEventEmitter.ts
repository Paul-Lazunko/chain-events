import { EventEmitter } from 'events';
import TypedEmitter, { EventMap } from 'typed-emitter';

import { ANY_EVENT, errors } from '../constants';
import { makeGenerator } from '../helpers';
import {
  ChainEventEmitterError,

} from '../errors';
import {
  ChainEventEmitterOptions,
  EventConfiguration,
  Logger,
  TChainEventErrorHandler,
  TChainEventHandler
} from '../options';

export class ChainEventEmitter<Events extends EventMap = EventMap> {

  private readonly context: any;
  private logger: Logger
  private eventEmitter: TypedEmitter<Events>;
  private events: Map<keyof Events | typeof ANY_EVENT, EventConfiguration<Events, keyof Events>>;

  constructor(options?: ChainEventEmitterOptions) {
    const self = this;
    const chainEventEmitterOptions: ChainEventEmitterOptions = Object.assign({
      eventEmitter: new EventEmitter(),
      context: self,
      logger: console
    }, options);
    this.logger = chainEventEmitterOptions.logger;
    this.eventEmitter = chainEventEmitterOptions.eventEmitter as TypedEmitter<Events>;
    this.context = chainEventEmitterOptions.context;
    this.events = new Map();
  }

  public on<E extends keyof Events>(event: E, ...eventHandlers: TChainEventHandler<Events, E>[]): void {
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

  public onError<E extends keyof Events | typeof ANY_EVENT>(event: E, errorHandler: TChainEventErrorHandler<Events, E>): void {
    if ( !this.events.has(event) ) {
      this.events.set(event, {
        status: true,
        handlers:[],
      });
    }
    this.events.get(event).errorHandler = errorHandler;
  }

  public off<E extends keyof Events>(event: E): void {
    if ( this.events.has(event) ) {
      this.events.delete(event);
      this.eventEmitter.removeAllListeners(event);
    }
  }

  public disable<E extends keyof Events>(event: E) {
    if ( this.events.has(event) ) {
      this.events.get(event).status = false;
    }
  }

  public enable<E extends keyof Events>(event: E) {
    if ( this.events.has(event) ) {
      this.events.get(event).status = true;
    }
  }

  emit<E extends keyof Events>(event: E, ...data: Parameters<Events[E]>): void {
    if ( event !== ANY_EVENT ) {
      this.eventEmitter.emit(event, ...data)
    }
  }

  protected getErrorHandler<E extends keyof Events>(event: E | typeof ANY_EVENT): TChainEventErrorHandler<Events, E> {
    if ( !this.events.has(event) || !this.events.get(event).errorHandler ) {
      event = ANY_EVENT
    }
    return this.events.get(event)?.errorHandler;
  }

  protected handleEvent<E extends keyof Events>(event: E) {
    const self = this;
    const anyEventHandlers = this.events.has(ANY_EVENT) ? this.events.get(ANY_EVENT).handlers : [];
    const eventOwnHandlers = this.events.has(event) ? this.events.get(event).handlers : [];
    const eventHandlers = [...anyEventHandlers, ...eventOwnHandlers];
    const generator = makeGenerator(eventHandlers);
    return function(data: any): void | Promise<void> {
      const executor = async () => {
        const eventHandler = generator.next();
        if ( eventHandler.value ) {
          await eventHandler.value.apply(self.context || this, [data, event, next]);
        }
      }
      const errorHandler = async (error: Error) => {
        try {
          const eventErrorHandler: TChainEventErrorHandler<Events, E> = self.getErrorHandler(event);
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
      const next = (): Promise<void> => {
        return executor().catch(errorHandler)
      };
      const isEventEnabled: boolean = self.events.has(event) && self.events.get(event).status;
      if ( isEventEnabled ) {
        return next();
      }
    } as Events[E];
  }
}
