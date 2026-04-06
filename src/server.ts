import { app } from './app'
import { env } from './config/env'

app.listen({ port: env.PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`IOUGURT API rodando na porta ${env.PORT}`)
})
