import type { IncomingMessage, ServerResponse } from 'http';

/**
 * Tipuri minime pentru funcțiile serverless Vercel (Node runtime), fără să
 * depindem de pachetul @vercel/node — acesta trage un lanț mare de
 * dependențe de build (folosite pentru `vercel dev`/`vercel build`) cu mai
 * multe vulnerabilități cunoscute, complet nefolosite de noi la runtime.
 * Vercel injectează exact aceste metode/proprietăți peste req/res standard.
 */
export interface VercelRequest extends IncomingMessage {
  body: any;
  query: { [key: string]: string | string[] };
  cookies: { [key: string]: string };
}

export interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (body: any) => VercelResponse;
  send: (body: any) => VercelResponse;
}
