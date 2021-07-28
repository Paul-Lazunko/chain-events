const { ChainEventEmitter } = require('../dist');
const { testEventName, enableEventName } = require('./testData')

const chainEventEmitter = new ChainEventEmitter();
let shouldFire = false;

chainEventEmitter.on(testEventName, async (data, event, next) => {

  if ( !shouldFire ) {
    throw new Error('Event handlers for this event should be disabled')
  }
});

chainEventEmitter.on(enableEventName, (data, event, next) => {
  if ( shouldFire ) {
    chainEventEmitter.disable(testEventName)
  } else {
    chainEventEmitter.enable(testEventName)
  }
  shouldFire = !shouldFire;
  chainEventEmitter.emit(testEventName, {});
});

chainEventEmitter.emit(enableEventName, {});
chainEventEmitter.emit(enableEventName, {});
