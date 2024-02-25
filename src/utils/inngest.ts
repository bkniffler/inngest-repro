import { EventSchemas, Inngest } from 'inngest';

export type EcoInngest = ReturnType<typeof innerUseInngest> & {
  cacheKey: string;
};
export type InngestOptions = {
  baseUrl?: string;
  appId: string;
  nodeEnv?: string;
  env?: {
    INNGEST_EVENT_KEY: string;
  };
};

function innerUseInngest({
  env,
  baseUrl,
  appId,
  nodeEnv = 'production',
}: InngestOptions) {
  return new Inngest({
    id: appId,
    baseUrl,
    schemas: new EventSchemas().fromRecord<any>(undefined as any),
    // middleware: [middleware],
    eventKey: env?.INNGEST_EVENT_KEY,
    env: nodeEnv,
  });
}

const cached: Record<string, EcoInngest> = {};
export function useInngest({
  env,
  baseUrl,
  appId,
  nodeEnv = 'production',
}: InngestOptions) {
  const key = `${appId}-${baseUrl}-${nodeEnv}`;
  if (!cached[key]) {
    cached[key] = innerUseInngest({ env, baseUrl, appId, nodeEnv }) as any;
    cached[key].cacheKey = key;
  }
  return cached[key];
}
