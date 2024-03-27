import type { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
  // exclude hongkong cause it's not supported by OpenAI
  regions: [
    "sin1",
    "hnd1",
    "cdg1",
    "arn1",
    "dub1",
    "lhr1",
    "iad1",
    "sfo1",
    "pdx1",
    "cle1",
    "gru1",
    "icn1",
    "kix1",
    "bom1",
    "syd1",
    "fra1",
    "cpt1",
  ],
};

export default async function handler(req: NextRequest) {
  const url = new URL(req.url);

  if (url.pathname.startsWith('/v1beta')) {
    url.host = 'generativelanguage.googleapis.com';
  } else if (url.pathname.startsWith('/headers')) {
    url.host = 'httpbin.org';
  } else if (url.pathname.startsWith('/openai/v1')) {
    url.host = 'api.groq.com';
  } else if (url.pathname.startsWith('/v1/messages') || url.pathname.startsWith('/v1/complete')) {
    url.host = 'api.anthropic.com';
  } else {
    url.host = 'api.openai.com';
  }
  
  url.protocol = 'https:';
  url.port = '';

  const headers = new Headers(req.headers);
  headers.set('host', url.host);

  const keysToDelete: string[] = [];
  headers.forEach((_, key: string) => {
    // console.log("key", key);
    if (key.toLowerCase().startsWith('x-') && key.toLowerCase() !== 'x-api-key') {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach((key: string) => {
    headers.delete(key);
  });

  // console.log("url.toString()", url.toString());

  try {
    const { method, body, signal } = req;
    
    const response = await fetch(
      url.toString(),
      {
        method,
        headers,
        body,
        signal,
      }
    );

    return response;
  } catch (error) {
    console.error('Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
