import { prisma } from '../../../../config/prisma'
import type { IDashboardRepository, DailyOverview, AdminMetrics } from '../../repositories/IDashboardRepository'
import dayjs from 'dayjs'

export class PrismaDashboardRepository implements IDashboardRepository {
  async getDailyOverview(date: Date, vetId?: string, clinicId?: string): Promise<DailyOverview> {
    const startOfDay = dayjs(date).startOf('day').toDate()
    const endOfDay = dayjs(date).endOf('day').toDate()

    const appointments = await prisma.appointment.findMany({
      where: {
        dateTime: { gte: startOfDay, lte: endOfDay },
        ...(vetId && { vetId }),
        ...(clinicId && { patient: { clinicId } }),
      },
      select: { status: true },
    })

    const overview: DailyOverview = {
      totalAppointments: appointments.length,
      scheduled: 0, inProgress: 0, completed: 0, cancelled: 0,
    }

    for (const appt of appointments) {
      if (appt.status === 'SCHEDULED') overview.scheduled++
      else if (appt.status === 'IN_PROGRESS') overview.inProgress++
      else if (appt.status === 'COMPLETED') overview.completed++
      else if (appt.status === 'CANCELLED') overview.cancelled++
    }

    return overview
  }

  async getAdminMetrics(clinicId: string): Promise<AdminMetrics> {
    const totalPatients = await prisma.patient.count({ where: { clinicId } })

    const startOfWeek = dayjs().startOf('week').toDate()
    const endOfWeek = dayjs().endOf('week').toDate()
    const appointmentsThisWeek = await prisma.appointment.count({
      where: { dateTime: { gte: startOfWeek, lte: endOfWeek }, patient: { clinicId } },
    })

    const startOfMonth = dayjs().startOf('month').toDate()
    const endOfMonth = dayjs().endOf('month').toDate()
    const appointmentsThisMonth = await prisma.appointment.count({
      where: { dateTime: { gte: startOfMonth, lte: endOfMonth }, patient: { clinicId } },
    })

    return { totalPatients, appointmentsThisWeek, appointmentsThisMonth }
  }
}
