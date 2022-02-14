import { EventMap } from 'typed-emitter';
import { TChainEventHandler } from '../options';

export function* makeGenerator<Events extends EventMap, E extends keyof Events>( callbacks: TChainEventHandler<Events, E>[] ) {

  for ( let i = 0; i < callbacks.length; i++ ) {

    yield callbacks[ i ];

  }

}
