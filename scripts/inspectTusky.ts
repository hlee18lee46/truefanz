// scripts/inspectTusky.ts
import 'dotenv/config';
import { Tusky } from '@tusky-io/ts-sdk';

function listMethods(obj: any, label: string) {
  const proto = Object.getPrototypeOf(obj);
  const names = new Set<string>([
    ...Object.getOwnPropertyNames(obj || {}),
    ...Object.getOwnPropertyNames(proto || {}),
  ]);
  console.log(`\n=== ${label} keys ===`);
  console.log([...names].sort().join(', '));
}

async function main() {
  const apiKey = process.env.TUSKY_API_KEY!;
  const vaultId = process.env.TUSKY_VAULT_ID!;
  if (!apiKey || !vaultId) throw new Error('Set TUSKY_API_KEY and TUSKY_VAULT_ID in .env');

  const client: any = new Tusky({ apiKey });

  console.log('\nTop-level client keys:', Object.keys(client));
  listMethods(client, 'client');
  if (client._storage) listMethods(client._storage, 'client._storage');
  if (client.api) {
    listMethods(client.api, 'client.api');
    if (client.api.storage) listMethods(client.api.storage, 'client.api.storage');
    if (client.api.files) listMethods(client.api.files, 'client.api.files');
    if (client.api.vaults) listMethods(client.api.vaults, 'client.api.vaults');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});