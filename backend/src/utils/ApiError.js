/**
 * Thin wrapper around Error that carries an HTTP status code and an optional
 * machine-readable `code` for the frontend.
 */
export class ApiError extends Error {
  constructor(status, message, code = undefined, details = undefined) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(msg, details)  { return new ApiError(400, msg, 'BAD_REQUEST',  details); }
  static unauthorized(msg = 'Unauthorized') { return new ApiError(401, msg, 'UNAUTHORIZED'); }
  static forbidden(msg = 'Forbidden')       { return new ApiError(403, msg, 'FORBIDDEN'); }
  static notFound(msg = 'Not found')        { return new ApiError(404, msg, 'NOT_FOUND'); }
  static conflict(msg = 'Conflict')         { return new ApiError(409, msg, 'CONFLICT'); }
  static tooMany(msg = 'Too many requests') { return new ApiError(429, msg, 'RATE_LIMITED'); }
  static internal(msg = 'Internal error')   { return new ApiError(500, msg, 'INTERNAL'); }
  static badGateway(msg = 'Upstream error') { return new ApiError(502, msg, 'BAD_GATEWAY'); }
}
