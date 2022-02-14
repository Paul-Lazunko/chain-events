import { EventMap } from 'typed-emitter';

export type TChainEventHandler<Events extends EventMap, E extends keyof Events> = (data: Parameters<Events[E]>, event: E, next: ()=>void) => void;
export type TChainEventErrorHandler<Events extends EventMap, E extends keyof Events> = (error: Error, data: Events[E], event: E) => void;
