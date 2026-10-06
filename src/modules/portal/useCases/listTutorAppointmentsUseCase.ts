import { AppError } from '../../../shared/errors/app-error'
import { prisma } from '../../../config/prisma'

export interface ListTutorAppointmentsInput {
  userId: string
}

export class ListTutorAppointmentsUseCase {
  async execute({ userId }: ListTutorAppointmentsInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tutorAccount: {
          include: {
            patients: { select: { id: true } },
          },
        },
      },
    })

    if (!user || user.role !== 'TUTOR') {
      throw new AppError('Acesso restrito ao portal do tutor.', 403)
    }

    const tutor = user.tutorAccount
    if (!tutor) {
      throw new AppError('Conta de tutor não encontrada.', 404)
    }

    const patientIds = tutor.patients.map(p => p.id)

    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: { in: patientIds },
      },
      orderBy: {
        dateTime: 'desc',
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            species: true,
          },
        },
      },
    })

    return { appointments }
  }
}
