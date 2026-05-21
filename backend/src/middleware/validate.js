import { ApiError } from '../utils/ApiError.js';

/**
 * Build an Express middleware that runs a zod schema against `req[location]`
 * and replaces the source with the parsed value (so downstream handlers get
 * the typed/transformed result).
 *
 *   router.post('/auth/signup', validate(signupSchema, 'body'), signup);
 */
export function validate(schema, location = 'body') {
  return function runValidate(req, _res, next) {
    const result = schema.safeParse(req[location]);
    if (!result.success) {
      const details = Object.fromEntries(
        result.error.issues.map((i) => [i.path.join('.') || '_', i.message]),
      );
      return next(ApiError.badRequest('Validation failed', details));
    }
    req[location] = result.data;
    next();
  };
}
