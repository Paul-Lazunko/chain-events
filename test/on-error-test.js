const { equal, deepEqual } = require('assert');

const { ChainEventEmitter, ANY_EVENT } = require('../dist');
const { testEventName, testSyncData, finalData } = require('./testData');

const chainEventEmitter = new ChainEventEmitter();


console.time('Initializing the package (sync)');

chainEventEmitter.on(ANY_EVENT, async (data, event, next) => {
  throw new Error('This error should be handled')
  next();
});

chainEventEmitter.on(testEventName, async (data, event, next) => {
  throw new Error(`This handler shouldn't be called`)
  next();
});

chainEventEmitter.onError(ANY_EVENT, async (error, data, event) => {
  equal(event, testEventName);
});

chainEventEmitter.emit(testEventName, {});
