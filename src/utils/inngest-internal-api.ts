import { retry } from '@finalytic/utils';

export async function inngestRegisterApp(port: number) {
  await retry(
    async () => {
      const response = await fetch(`http://127.0.0.1:${port}/api/inngest`, {
        method: 'PUT',
      });
      const json: any = await response.json();
      if (json.errors?.length) {
        throw new Error(json.errors[0].message);
      }
      return json;
    },
    {
      attempts: 5,
      waitFor: '100ms',
    }
  );
}
