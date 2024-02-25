import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import { waitFor, waitUntil } from '@finalytic/utils';
import { referenceFunction } from 'inngest';
import northbase from './northbase.json';
import { registerFn, useMockInngest } from './utils';

describe('e2e setup-guide handle-accounts', () => {
  let mockInngest: Awaited<ReturnType<typeof useMockInngest>> =
    undefined as any;
  beforeAll(async () => (mockInngest = await useMockInngest()));
  afterAll(() => mockInngest.kill());

  it(
    'should work',
    async () => {
      const expected = 5;
      let invoked = 0;

      await registerFn(mockInngest, [
        mockInngest.inngest.createFunction(
          { id: 'trigger' },
          { event: 'api/trigger' },
          async ({ logger }) => {
            logger.info('triggered');
            await waitFor('1s');
            return northbase;
          }
        ),
        mockInngest.inngest.createFunction(
          { id: 'invoke' },
          { event: 'api/invoke' },
          async ({ event, step, logger }) => {
            logger.info('invoked');
            await waitFor('1s');

            await step.sendEvent('api/trigger', {
              data: event.data,
              name: 'api/trigger',
            });

            invoked++;
            return northbase;
          }
        ),
        mockInngest.inngest.createFunction(
          { id: 'caller' },
          { event: 'api/call' },
          async ({ step, logger }) => {
            logger.info('Starting');
            const all = new Array(expected).fill(null).map((_, i) => {
              return () =>
                step.invoke(`run ${i}`, {
                  function: referenceFunction({ functionId: 'invoke' }),
                  data: { i },
                });
            });

            for (const p of all) {
              logger.info('running');
              await p();
            }
            logger.info('All done');
          }
        ),
      ]);

      await mockInngest.inngest.send({ name: 'api/call' });
      await waitUntil(() => invoked === expected, { timeoutAfter: '20s' });
      expect(invoked).toBe(expected);
    },
    { timeout: 30_000 }
  );
});
