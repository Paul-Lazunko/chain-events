const { equal, deepEqual } = require('assert');

const { ChainEventEmitter, ANY_EVENT } = require('../dist');
const { testEventName, testSyncData, finalData } = require('./testData');

const chainEventEmitter = new ChainEventEmitter();


console.time('Initializing the package (sync)');

chainEventEmitter.on(ANY_EVENT, async (data, event, next) => {
  equal(event, testEventName);
  data.a = true;
  next();
});

chainEventEmitter.on(ANY_EVENT, async (data, event, next) => {
  equal(event, testEventName);
  equal(data.a, true);
  equal(data.b, false);
  equal(data.c, false);
  data.b = true;
  next();
});

chainEventEmitter.on(testEventName, async (data, event, next) => {
  equal(event, testEventName);
  equal(data.a, true);
  equal(data.b, true);
  equal(data.c, false);
  data.c = true;
  next();
});

chainEventEmitter.on(testEventName, (data, event, next) => {
  equal(event, testEventName);
  deepEqual(data, finalData);
  console.timeEnd('Emit test event (sync)')
});

chainEventEmitter.on(testEventName, (data, event, next) => {
  throw new Error(`This handler shouldn't fire because next wasn't called in previous handler`)
});

console.timeEnd('Initializing the package (sync)');

console.time('Emit test event (sync)');

chainEventEmitter.emit(testEventName, testSyncData)
