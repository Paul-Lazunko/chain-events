Events are the keystone of Node.js, with EventEmitter being a fundamental thing or a base plate for a lot of engineering solutions and features of this platform.  Unfortunately, when calling an event, all its handlers are set off and run independently of each other, and that isn`t always very convenient. Moreover, it would be better to have a chance to manage calls of these handlers while consistently and sequentially checking  and changing passed data.

And **chain-events** is the library that provides these options.

Its use is similar to using the existing EventEmitter. It can be easily and effectively used by junior developers as well.

**1. Installation**

```bash

npm i chain-events

```
**2. First steps**

To start using the package, you have to create an instance of the ChainEventEmitter class, just as if you would create an instance of  the standard EventEmiiter. There is only one exception, though: you can pass an optional configuration object to the ChainEventEmitter constructor:

```javascript

const { ChainEventEmitter } = require('chain-events');

const chainEventEmitter = new ChainEventEmitter({
  eventEmitter: new EventEmitter(),
  context: {},
  logger: console
});

// or

const chainEventEmitter2 = new ChainEventEmitter();

```

The eventEmitter property is optional, and it allows you to use chained events for an instance of any class that extends EventEmitter. 
The **context** parameter is optional also. It specifies the execution context of all your handlers, and it can be an aggregating object with a lot of useful helpers, functions, services etc – anything you want. 
By default, if this parameter hasn`t been passed, the created **ChainEventEmitter** class instance wil be used as the execution context (a very useful thing when you want to have events that are created on the fly). 
The next optional parameter is **logger** (it is **console** by default). It allows you to manage the display of service messages (error messages only, there are no other messages in the package).


**3. Event handlers**

Event handlers can be asynchronous, they will be triggered in order they were registered, 
and your every handler will get three arguments:

**data** - the data that you pass when triggering the event
**event** - your event, a string
**next** - a function which, when called, passes the execution to the next handler 
(in other words, if you don`t call it inside the handler, the execution chain will be stopped).

```javascript

const { ChainEventEmitter } = require('chain-events');

const chainEventEmitter = new ChainEventEmitter();

chainEventEmitter.on('someEvent', async (data, event, next) => {
  // do something with data
  await next();
});

chainEventEmitter.on('someEvent', async (data, event, next) => {
  // do something else with data
  await next();
});

```

It is extremely easy, and, if you have some experience with Express.js, it is like using Express.js middleware.

You can also use general handlers that will be executed when triggering all registered events (please note that for every triggered event initially a chain of general handlers is executed).

```javascript

const { ChainEventEmitter, ANY_EVENT } = require('chain-events');

const chainEventEmitter = new ChainEventEmitter();

chainEventEmitter.on(ANY_EVENT, async (data, event, next) => {
  // do something with data
  console.log('Any event first handler fired')
  await next();
});


chainEventEmitter.on(ANY_EVENT, async (data, event, next) => {
  // do something with data
  console.log('Any event second handler fired')
  await next();
});

chainEventEmitter.on('someEvent', async (data, event, next) => {
  // do something else with data
  await next();
});

```

Besides the fact that these general handlers will be executed before anything else happens, (remember that you have to call **next**), 
they have another characteristic, that is they can`t be called separately from handlers of concrete event (in other words, ANY_EVENT can’t be triggered). 
At the same time, they will be executed before any other handlers of any registered event. 
The **event** parameter is passed to handlers just for the purpose of allowing you to diversify the behavior of handlers according to the name of the triggered event.

**4. Handling errors**

When your handlers are executed, errors can occur. To handle them, you can use the **onError** method with the name of the event and the error handler passed to it:

```javascript

chainEventEmitter.onError('someEvent', async (error, data, event) => {
  // do something else with data
  next();
});

```

The handler that is passed to the **onError** accepts three arguments:
**error** - the error thrown
**data** - the data passed (with all changes made before the error)
**event** - name of the triggered event


**5. Triggering events**

It is extremely easy to trigger an event, just as you would do with the standard EventEmitter. For that you can use the **emit** method, where you pass the name of the event and the data:


```javascript

chainEventEmitter.emit('someEvent', {});

```

**6. Removing, enabling and disabling an event**

You can remove all handlers for a particular event:

```javascript

chainEventEmitter.off('someEvent');

```

If you want to temporarily stop the execution of event handlers, you can use the **disable** method:

```javascript

chainEventEmitter.disable('someEvent');

```
In this case you will be able to turn it on again using the **enable** method:

```javascript

chainEventEmitter.enable('someEvent');

```

P.S. I sincerely hope that this package will be very helpful. If you have found any discrepancies, you can always create an issue at https://github.com/Paul-Lazunko/chain-events
