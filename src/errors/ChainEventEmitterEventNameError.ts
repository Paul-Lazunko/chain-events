import { ChainEventEmitterError } from './ChainEventEmitterError';
import { errors } from '../constants';

export class ChainEventEmitterEventNameError extends ChainEventEmitterError {
  public message: string = errors.invalidEventName as string;
}
