import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { AppError } from '../../../shared/errors/app-error'
import { prisma } from '../../../config/prisma'

interface CreateTutorAccountRequest {
  tutorId: string   // ID do tutor já cadastrado
  email: string     // email de login que o vet define
}

interface CreateTutorAccountResponse {
  userId: string
  email: string
  temporaryPassword: string  // retornado uma vez, tutor muda depois
}

export class CreateTutorAccountUseCase {
  async execute({ tutorId, email }: CreateTutorAccountRequest): Promise<CreateTutorAccountResponse> {
    const tutor = await prisma.tutor.findUnique({ where: { id: tutorId } })

    if (!tutor) {
      throw new AppError('Tutor não encontrado.', 404)
    }

    if (tutor.userId) {
      throw new AppError('Este tutor já possui uma conta de acesso ao portal.', 400)
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      throw new AppError('Este e-mail já está em uso.', 400)
    }

    // Gera senha temporária segura: 12 caracteres aleatórios
    const temporaryPassword = randomBytes(6).toString('hex') // ex: "a3f2e1b4c8d9"
    const passwordHash = await bcrypt.hash(temporaryPassword, 8)

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: tutor.fullName,
        role: 'TUTOR',
        tutorAccount: {
          connect: { id: tutorId },
        },
      },
    })

    return {
      userId: user.id,
      email: user.email,
      temporaryPassword, // retornado apenas agora — não é persistido em texto claro
    }
  }
}
