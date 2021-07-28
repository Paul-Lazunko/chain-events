import { TChainEventHandler } from '../options';

export function* makeGenerator( callbacks: TChainEventHandler[] ) {

  for ( let i = 0; i < callbacks.length; i++ ) {

    yield callbacks[ i ];

  }

}
