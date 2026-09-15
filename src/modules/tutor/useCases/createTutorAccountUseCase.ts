import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { Errors } from '../../../core/errors'
import { prisma } from '../../../config/prisma'
import { makeSendFirstAccessInviteUseCase } from '../../auth/useCases/factories/makeSendFirstAccessInviteUseCase'
import type { SendFirstAccessInviteUseCase } from '../../auth/useCases/sendFirstAccessInviteUseCase'

interface CreateTutorAccountRequest {
  tutorId: string       // ID do tutor já cadastrado
  email: string         // email de login que o vet define
  userClinicId: string  // clínica do usuário autenticado
  userRole: string      // perfil do usuário autenticado
}

interface CreateTutorAccountResponse {
  userId: string
  email: string
}

export class CreateTutorAccountUseCase {
  constructor(
    private sendFirstAccessInviteUseCase?: SendFirstAccessInviteUseCase,
  ) {}

  async execute({ tutorId, email, userClinicId, userRole }: CreateTutorAccountRequest): Promise<CreateTutorAccountResponse> {
    if (userRole !== 'VET' && userRole !== 'OWNER') {
      throw Errors.forbidden('Apenas veterinários ou donos da clínica podem criar contas de acesso de tutores.')
    }

    if (!email || !email.trim()) {
      throw Errors.badRequest('E-mail é obrigatório para criar a conta de acesso.')
    }

    const normalizedEmail = email.toLowerCase().trim()

    const tutor = await prisma.tutor.findUnique({
      where: { id: tutorId },
      include: { clinic: true },
    })

    if (!tutor) {
      throw Errors.notFound('Tutor não encontrado.')
    }

    if (tutor.clinicId !== userClinicId) {
      throw Errors.forbidden('Acesso negado: Tutor pertence a outra clínica.')
    }

    if (tutor.userId) {
      throw Errors.badRequest('Este tutor já possui uma conta de acesso ao portal.')
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existingUser) {
      throw Errors.badRequest('Este e-mail já está em uso.')
    }

    // Gera um hash seguro para a senha inicial (a senha definitiva será definida no Primeiro Acesso)
    const randomPassword = randomBytes(16).toString('hex')
    const passwordHash = await bcrypt.hash(randomPassword, 8)

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: tutor.fullName,
        role: 'TUTOR',
        clinicId: tutor.clinicId,
        tutorAccount: {
          connect: { id: tutorId },
        },
      },
    })

    // Sincroniza o e-mail no cadastro do Tutor se não estiver preenchido
    if (!tutor.email) {
      await prisma.tutor.update({
        where: { id: tutorId },
        data: { email: normalizedEmail },
      })
    }

    const sendInviteUseCase =
      this.sendFirstAccessInviteUseCase ?? makeSendFirstAccessInviteUseCase()

    await sendInviteUseCase.execute({
      userId: user.id,
      clinicName: tutor.clinic?.name,
    })

    return {
      userId: user.id,
      email: user.email,
    }
  }
}
