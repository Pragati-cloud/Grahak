import { DbConnection } from './module_bindings';

export const connection = DbConnection.builder()
  .withUri('wss://maincloud.spacetimedb.com')
  .withDatabaseName('grahak')
  .onConnect((conn, identity, token) => {
    console.log('✅ Connected to SpacetimeDB! Identity:', identity.toHexString());
    localStorage.setItem('stdb_token', token);
  })
  .onConnectError((conn, err) => {
    console.error('❌ Failed to connect to SpacetimeDB:', err);
  })
  .onDisconnect((conn) => {
    console.warn('⚠️ Disconnected from SpacetimeDB. Attempting to reconnect...');
  })
  .withToken(localStorage.getItem('stdb_token') ?? undefined)
  .build();

