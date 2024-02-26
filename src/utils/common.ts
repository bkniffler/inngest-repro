import { spawn } from 'child_process';
import { random } from '@finalytic/utils';
import { serve } from 'inngest/cloudflare';
import { waitUntilFree, waitUntilUsed } from 'tcp-port-used';
import kill from 'terminate/promise';
import { useInngest } from './inngest';
import { inngestRegisterApp } from './inngest-internal-api';

const usedPorts: number[] = [];
export const getNextPort = (start = 11_000, end = 12_000): number => {
  const r = random(start, end);
  if (usedPorts.includes(r)) return getNextPort();
  usedPorts.push(r);
  return r;
};

export async function registerFn(
  inn: {
    inngest: any;
    inngestBaseUrl: string;
  },
  functions: any[]
) {
  const s = serve({
    functions,
    client: inn.inngest,
    baseUrl: inn.inngestBaseUrl,
  });
  const server = Bun.serve({
    fetch(request) {
      return s({
        request,
        env: process.env,
      } as any);
    },
    port: getNextPort(),
  });
  await waitUntilUsed(Number(server.port), 100, 8_000);
  await inngestRegisterApp(server.port);
  return () => server.stop();
}

export async function useMockInngest() {
  const workerPort = getNextPort(10_000, 11_000);

  const inngestBaseUrl = `http://127.0.0.1:${getNextPort(10_000, 11_000)}`;
  const inngestPort = new URL(inngestBaseUrl).port;

  console.log(inngestBaseUrl);

  const inngest = useInngest({
    appId: 'local-testing',
    baseUrl: inngestBaseUrl,
    nodeEnv: 'testing',
    env: process.env as any,
  });

  const server = Bun.serve({
    fetch(request) {
      const s = serve({
        client: inngest,
        functions: [],
      });
      return s({
        request,
        env: process.env,
      } as any);
    },
    port: workerPort,
  });

  const child = spawn(
    'bunx',
    `inngest dev --tick 10 --no-discovery --port ${String(
      inngestPort
    )} -u http://127.0.0.1:${workerPort}/api/inngest`.split(' '),
    {
      // detached: true,
      stdio: 'inherit',
    }
  );
  child.unref();
  await Promise.all([
    waitUntilUsed(Number(inngestPort), 100, 8_000),
    waitUntilUsed(Number(workerPort), 100, 8_000),
  ]);

  return {
    async kill() {
      server.stop();
      await kill(child.pid!);
      await Promise.all([
        waitUntilFree(Number(inngestPort), 100, 8_000),
        waitUntilFree(Number(workerPort), 100, 8_000),
      ]);
    },
    inngestBaseUrl,
    inngest,
  };
}
