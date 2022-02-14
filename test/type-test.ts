import { EventEmitter } from "events"
import { ChainEventEmitter } from "../src"

type Events = {
    "close": (message: string) => void
}

let emitter = new ChainEventEmitter<Events>({
    context: {},
    eventEmitter: new EventEmitter(),
    logger: console
})

emitter.on("close", ([message], name, next) => {
    // next isnt typed properly
    // but well, what even is next?
    // why are the examples calling it without await and args?
    // 
})
emitter.emit("close", "xxx")