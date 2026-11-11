/**
 * Fails fast at startup when required configuration is missing or unsafe.
 * Used by ConfigModule.forRoot({ validate }).
 */
const REQUIRED = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'] as const;

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const missing = REQUIRED.filter((key) => !String(config[key] ?? '').trim());
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  if (config.JWT_SECRET === config.JWT_REFRESH_SECRET) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different values.');
  }
  if (config.PORT !== undefined && Number.isNaN(Number(config.PORT))) {
    throw new Error('PORT must be a number.');
  }
  if (config.NODE_ENV === 'production') {
    const weak = ['JWT_SECRET', 'JWT_REFRESH_SECRET'].filter((key) => String(config[key]).length < 32);
    if (weak.length > 0) {
      throw new Error(`In production these secrets must be at least 32 characters: ${weak.join(', ')}`);
    }
  }
  return config;
}
