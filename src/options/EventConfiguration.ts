import { TChainEventErrorHandler, TChainEventHandler} from './chainEventHandlers';

export interface EventConfiguration {
  status: boolean,
  handlers: TChainEventHandler[],
  errorHandler?: TChainEventErrorHandler
}
