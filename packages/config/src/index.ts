export interface Config {
  app: {
    name: string;
    version: string;
    env: 'development' | 'staging' | 'production';
  };
  database: {
    url: string;
  };
  redis: {
    url: string;
  };
  jwt: {
    accessTokenSecret: string;
    accessTokenExpiry: string;
    refreshTokenSecret: string;
    refreshTokenExpiry: string;
  };
  stripe: {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
  };
  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    s3Bucket: string;
    endpoint?: string;
  };
  cors: {
    origin: string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

export function loadConfig(): Config {
  const requiredEnvVars = [
    'DATABASE_URL',
    'REDIS_URL',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_BUCKET',
  ];

  const missing = requiredEnvVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    app: {
      name: 'LUXE Rental',
      version: '1.0.0',
      env: (process.env.NODE_ENV || 'development') as Config['app']['env'],
    },
    database: {
      url: process.env.DATABASE_URL!,
    },
    redis: {
      url: process.env.REDIS_URL!,
    },
    jwt: {
      accessTokenSecret: process.env.JWT_ACCESS_SECRET!,
      accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
      refreshTokenSecret: process.env.JWT_REFRESH_SECRET!,
      refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY!,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    },
    aws: {
      region: process.env.AWS_REGION!,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      s3Bucket: process.env.AWS_S3_BUCKET!,
      endpoint: process.env.AWS_ENDPOINT_URL,
    },
    cors: {
      origin: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001')
        .split(',')
        .map((o) => o.trim()),
      credentials: true,
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'),
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    },
  };
}
