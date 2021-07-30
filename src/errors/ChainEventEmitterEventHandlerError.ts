import { ChainEventEmitterError } from './ChainEventEmitterError';
import { errors } from '../constants';

export class ChainEventEmitterEventHandlerError extends ChainEventEmitterError {
  public message: string = errors.invalidEventHandler as string;
}
