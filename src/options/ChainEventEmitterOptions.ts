import { EventEmitter } from 'events';
import { Logger } from './Logger';

export interface ChainEventEmitterOptions {
  eventEmitter?: EventEmitter,
  context?: any,
  logger?: Logger
}
