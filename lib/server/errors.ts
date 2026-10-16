/** Typed HTTP errors thrown by services and mapped to JSON by `handle()`. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
  }
}

export const unauthorized = (msg = "Please sign in.") =>
  new HttpError(401, "unauthorized", msg);

export const forbidden = (msg = "You don't have access to this resource.") =>
  new HttpError(403, "forbidden", msg);

export const notFound = (msg = "Not found.") => new HttpError(404, "not_found", msg);

export const conflict = (msg: string) => new HttpError(409, "conflict", msg);

export const badRequest = (msg: string, fields?: Record<string, string>) =>
  new HttpError(400, "bad_request", msg, fields);
