const { ChainEventEmitter } = require('../dist');
const { testEventName } = require('./testData')

const chainEventEmitter = new ChainEventEmitter();

chainEventEmitter.on(testEventName, (data, event, next) => {
  throw new Error('Event handlers for this event should be removed')
});

chainEventEmitter.off(testEventName);

chainEventEmitter.emit(testEventName, {});
