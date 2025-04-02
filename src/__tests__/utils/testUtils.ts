import { DefaultBodyType, PathParams, ResponseComposition, RestContext, RestRequest } from 'msw';

export type MockHandler = (
  req: RestRequest<DefaultBodyType, PathParams>,
  res: ResponseComposition<DefaultBodyType>,
  ctx: RestContext
) => Promise<any> | any;

export const SUPABASE_URL = 'http://localhost:54321';

export const buildUrl = (path: string) => `${SUPABASE_URL}/rest/v1${path}`;

export const mockErrorResponse = (status: number, message: string): MockHandler => {
  return (req, res, ctx) => {
    return res(ctx.status(status), ctx.json({ message }));
  };
};

export const mockSuccessResponse = <T>(data: T): MockHandler => {
  return (req, res, ctx) => {
    return res(ctx.json(data));
  };
}; 