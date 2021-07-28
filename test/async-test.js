const { equal, deepEqual } = require('assert');
const { EventEmitter } = require('events');

const { ChainEventEmitter, ANY_EVENT } = require('../dist');
const  { timeoutPromise } = require('./timeoutPromise');
const { testEventName, testAsyncData, finalData } = require('./testData')

const chainEventEmitter = new ChainEventEmitter();

console.time('Initializing the package (async)');

chainEventEmitter.on(ANY_EVENT, async (data, event, next) => {
  equal(event, testEventName);
  await timeoutPromise(() => {
    data.a = true;
  },0)
  next();
});

chainEventEmitter.on(ANY_EVENT, async (data, event, next) => {
  equal(event, testEventName);
  equal(data.a, true);
  equal(data.b, false);
  equal(data.c, false);
  await timeoutPromise(() => {
    data.b = true;
  },0)
  next();
});

chainEventEmitter.on(testEventName, async (data, event, next) => {
  equal(event, testEventName);
  equal(data.a, true);
  equal(data.b, true);
  equal(data.c, false);
  await timeoutPromise(() => {
    data.c = true;
  },0)
  next();
});

chainEventEmitter.on(testEventName, (data, event, next) => {
  equal(event, testEventName);
  deepEqual(data, finalData);
  console.timeEnd('Emit test event (async)')
});

chainEventEmitter.on(testEventName, (data, event, next) => {
  throw new Error(`This handler shouldn't fire because next wasn't called in previous handler`)
});

console.timeEnd('Initializing the package (async)');

console.time('Emit test event (async)');

chainEventEmitter.emit(testEventName, testAsyncData)
