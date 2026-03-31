import { AppError } from '../../../shared/errors/app-error'
import { prisma } from '../../../config/prisma'
import dayjs from 'dayjs'

interface GetTutorAlertsRequest {
  userId: string
}

export class GetTutorAlertsUseCase {
  async execute({ userId }: GetTutorAlertsRequest) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tutorAccount: { include: { patients: true } } },
    })

    if (!user || user.role !== 'TUTOR') {
      throw new AppError('Acesso restrito ao portal do tutor.', 403)
    }

    const tutor = user.tutorAccount

    if (!tutor) {
      throw new AppError('Conta de tutor não encontrada.', 404)
    }

    const patientIds = tutor.patients.map(p => p.id)
    const alerts: Array<{
      type: 'overdue_vaccine' | 'upcoming_vaccine' | 'vet_recommendation'
      message: string
      patientName: string
      date?: Date
    }> = []

    // Vacinas atrasadas
    const overdueVaccines = await prisma.vaccination.findMany({
      where: { patientId: { in: patientIds }, status: 'OVERDUE' },
      include: { patient: { select: { name: true } } },
    })

    for (const v of overdueVaccines) {
      alerts.push({
        type: 'overdue_vaccine',
        message: `Vacina "${v.vaccineName}" está atrasada!`,
        patientName: v.patient.name,
        date: v.nextDoseAt ?? undefined,
      })
    }

    // Vacinas nos próximos 30 dias
    const soon = await prisma.vaccination.findMany({
      where: {
        patientId: { in: patientIds },
        status: 'PENDING',
        nextDoseAt: {
          gte: new Date(),
          lte: dayjs().add(30, 'day').toDate(),
        },
      },
      include: { patient: { select: { name: true } } },
    })

    for (const v of soon) {
      alerts.push({
        type: 'upcoming_vaccine',
        message: `Vacina "${v.vaccineName}" vence em breve.`,
        patientName: v.patient.name,
        date: v.nextDoseAt ?? undefined,
      })
    }

    // Recomendações do último prontuário finalizado de cada pet
    for (const patientId of patientIds) {
      const lastRecord = await prisma.clinicalRecord.findFirst({
        where: { patientId, finalized: true },
        orderBy: { createdAt: 'desc' },
        include: { patient: { select: { name: true } } },
      })

      if (lastRecord?.routineGuidance) {
        alerts.push({
          type: 'vet_recommendation',
          message: lastRecord.routineGuidance,
          patientName: lastRecord.patient.name,
        })
      }
    }

    return { alerts }
  }
}
