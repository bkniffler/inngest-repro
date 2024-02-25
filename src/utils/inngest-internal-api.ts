import { retry } from '@finalytic/utils';

export async function inngestRegisterApp(inngestBaseUrl: string, port: number) {
  await retry(
    async () => {
      const response = await fetch(`${inngestBaseUrl}/v0/gql`, {
        headers: {
          accept: '*/*',
          'accept-language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
          'content-type': 'application/json',
          'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          Referer: `${inngestBaseUrl}/apps`,
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
        body: JSON.stringify({
          query: `
            mutation CreateApp($input: CreateAppInput!) {
              createApp(input: $input) {
                url
              }
          }`,
          variables: { input: { url: `http://127.0.0.1:${port}` } },
          operationName: 'CreateApp',
        }),
        method: 'POST',
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

export async function inngestDeleteApp(inngestBaseUrl: string, id: string) {
  await retry(
    async () => {
      const response = await fetch(`${inngestBaseUrl}/v0/gql`, {
        headers: {
          accept: '*/*',
          'accept-language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
          'content-type': 'application/json',
          'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          Referer: `${inngestBaseUrl}/apps`,
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
        body: JSON.stringify({
          query: `
            mutation DeleteApp($id: String!) {
              deleteApp(id: $id)
          }`,
          variables: { id },
          operationName: 'DeleteApp',
        }),
        method: 'POST',
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
