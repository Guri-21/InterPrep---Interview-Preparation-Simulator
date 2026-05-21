import 'dotenv/config';

/**
 * Centralized, validated environment configuration.
 * Reading env vars anywhere else in the codebase is a smell — always import
 * from here so that missing-required-var checks fail loud at boot time.
 */

function required(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) {
    throw new Error(`[env] Missing required environment variable: ${name}`);
  }
  return v;
}

function optional(name, fallback) {
  const v = process.env[name];
  return v && String(v).trim() ? v : fallback;
}

function intOpt(name, fallback) {
  const raw = optional(name, fallback);
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

const NODE_ENV = optional('NODE_ENV', 'development');
const isProd = NODE_ENV === 'production';

export const env = {
  NODE_ENV,
  isProd,

  PORT: intOpt('PORT', 4000),
  MONGO_URI: required('MONGO_URI'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRE: optional('JWT_EXPIRE', '7d'),
  BCRYPT_ROUNDS: intOpt('BCRYPT_ROUNDS', 10),

  CLIENT_URL: optional('CLIENT_URL', 'http://localhost:3000'),

  AI_PROVIDER: optional('AI_PROVIDER', 'gemini').toLowerCase(),
  ANTHROPIC_API_KEY: optional('ANTHROPIC_API_KEY', ''),
  ANTHROPIC_MODEL:   optional('ANTHROPIC_MODEL', 'claude-sonnet-4-5'),
  OPENAI_API_KEY:    optional('OPENAI_API_KEY', ''),
  GEMINI_API_KEY:    optional('GEMINI_API_KEY', ''),
  GEMINI_MODEL:      optional('GEMINI_MODEL', 'gemini-2.5-flash'),

  ADMIN_EMAIL:    optional('ADMIN_EMAIL', ''),
  ADMIN_PASSWORD: optional('ADMIN_PASSWORD', ''),
  ADMIN_NAME:     optional('ADMIN_NAME', 'Platform Admin'),
};

/** Comma-separated CORS origins → array. */
export function getAllowedOrigins() {
  return env.CLIENT_URL.split(',').map((s) => s.trim()).filter(Boolean);
}
