import { AppError } from '../../../shared/errors/app-error'
import { prisma } from '../../../config/prisma'
import dayjs from 'dayjs'

interface GetTutorDashboardRequest {
  userId: string
}

export class GetTutorDashboardUseCase {
  async execute({ userId }: GetTutorDashboardRequest) {
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

    // Últimos 3 agendamentos dos pets do tutor
    const recentAppointments = await prisma.appointment.findMany({
      where: { patientId: { in: patientIds } },
      orderBy: { dateTime: 'desc' },
      take: 3,
      include: {
        patient: { select: { id: true, name: true, species: true } },
        vet: { select: { id: true, name: true } },
      },
    })

    // Próximas vacinas (pendentes nos próximos 60 dias)
    const upcomingVaccinations = await prisma.vaccination.findMany({
      where: {
        patientId: { in: patientIds },
        status: 'PENDING',
        nextDoseAt: {
          gte: new Date(),
          lte: dayjs().add(60, 'day').toDate(),
        },
      },
      orderBy: { nextDoseAt: 'asc' },
      include: { patient: { select: { id: true, name: true } } },
    })

    return {
      tutor: {
        id: tutor.id,
        fullName: tutor.fullName,
        email: tutor.email,
      },
      pets: tutor.patients.map(p => ({
        id: p.id,
        name: p.name,
        species: p.species,
        breed: p.breed,
      })),
      recentAppointments,
      upcomingVaccinations,
    }
  }
}
