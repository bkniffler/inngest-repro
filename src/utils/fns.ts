import { waitFor } from '@finalytic/utils';
import { serve } from 'inngest/cloudflare';
import northbase from '../northbase.json';
import type { EcoInngest } from './inngest';

const cache: Record<string, ReturnType<typeof serve>> = {};
// Cache the fns for slightly faster cold starts
export function useInngestFns(inngest: EcoInngest) {
  if (!cache[inngest.cacheKey])
    cache[inngest.cacheKey] = serve({
      client: inngest,
      functions: [
        inngest.createFunction(
          { id: 'trigger' },
          { event: 'api/trigger' },
          async () => {
            await waitFor('1s');
            return northbase;
          }
        ),
      ],
    });
  return cache[inngest.cacheKey];
}
