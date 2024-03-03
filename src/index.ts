import { EventSchemas, type GetStepTools, Inngest } from 'inngest';

export type InngestOptions = {
  baseUrl?: string;
  appId: string;
  nodeEnv?: string;
  env?: {
    INNGEST_EVENT_KEY: string;
  };
};

const inngest = new Inngest({
  id: 'asd',
  schemas: new EventSchemas().fromRecord<{
    foo: { data: { foo: string } };
    bar: { data: { bar: string } };
  }>(),
});
const fn = inngest.createFunction(
  {
    id: 'asd',
  },
  {
    event: 'bar',
  },
  async ({}) => {
    return { foo: 'baz' } as const;
  }
);

type Steps = GetStepTools<typeof inngest>;

export async function useStep(step: Steps) {
  const result = await step.invoke('abc', {
    function: fn,
    data: { bar: 'asd' },
  });

  if (result.foo) console.log('Good');
}
