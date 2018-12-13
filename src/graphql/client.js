import { Lokka } from 'lokka';
import { Transport } from 'lokka-transport-http';

const client = new Lokka({
  transport: new Transport('https://api.graph.cool/simple/v1/frontity-v1'),
});

export default client;
