import { EventSchemas, Inngest } from 'inngest';

export type InngestOptions = {
  baseUrl?: string;
  appId: string;
  nodeEnv?: string;
  env?: {
    INNGEST_EVENT_KEY: string;
  };
};

export function useInngest({
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
