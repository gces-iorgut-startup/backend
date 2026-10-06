import { AppError } from '../../../shared/errors/app-error'
import { prisma } from '../../../config/prisma'
import { type AppointmentCategory, AppointmentStatus } from '@prisma/client'

export interface RequestAppointmentInput {
  userId: string
  patientId: string
  category: AppointmentCategory
  dateTime: Date
  observation?: string
}

export class RequestAppointmentUseCase {
  async execute({ userId, patientId, category, dateTime, observation }: RequestAppointmentInput) {
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

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    })

    if (!patient) {
      throw new AppError('Paciente não encontrado.', 404)
    }

    if (patient.tutorId !== tutor.id) {
      throw new AppError('Você não tem permissão para solicitar agendamento para este animal.', 403)
    }

    if (dateTime <= new Date()) {
      throw new AppError('A data do agendamento deve ser futura.', 400)
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        vetId: null,
        dateTime,
        endDateTime: null,
        category,
        status: AppointmentStatus.PENDING_APPROVAL,
        observation: observation ?? null,
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

    return { appointment }
  }
}
