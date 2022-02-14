import { EventMap } from 'typed-emitter';
import { TChainEventErrorHandler, TChainEventHandler} from './chainEventHandlers';

export interface EventConfiguration<Events extends EventMap, E extends keyof Events> {
  status: boolean,
  handlers: TChainEventHandler<Events, E>[],
  errorHandler?: TChainEventErrorHandler<Events, E>
}
