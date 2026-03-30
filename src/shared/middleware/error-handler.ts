import { AppError } from '../errors/app-error'
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'

export function errorHandler(
  error: FastifyError | AppError | ZodError | Error,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  // Zod validation errors
  if (error instanceof ZodError) {
    return reply.status(422).send({
      statusCode: 422,
      error: 'Validation Error',
      issues: error.flatten().fieldErrors,
    })
  }

  // AppError (domain errors from Use Cases)
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.message,
    })
  }

  // Fastify built-in errors (e.g. 404 Not Found)
  if ('statusCode' in error && error.statusCode) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.message,
    })
  }

  // Unhandled errors
  console.error(error)
  return reply.status(500).send({
    statusCode: 500,
    error: 'Internal Server Error',
  })
}
