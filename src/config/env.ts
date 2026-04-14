import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('30m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  GEMINI_API_KEY: z.string().default(''),
  GOOGLE_CLIENT_ID: z.string().default(''),
  RESEND_API_KEY: z.string(),
  MAIL_FROM: z.string().email().default(''),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error('Variáveis de ambiente inválidas:')
  console.error(_env.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = _env.data
