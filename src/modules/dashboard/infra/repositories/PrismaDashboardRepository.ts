import { prisma } from '../../../../config/prisma'
import type { IDashboardRepository, DailyOverview, AdminMetrics } from '../../repositories/IDashboardRepository'
import dayjs from 'dayjs'

export class PrismaDashboardRepository implements IDashboardRepository {
  async getDailyOverview(date: Date, vetId?: string): Promise<DailyOverview> {
    const startOfDay = dayjs(date).startOf('day').toDate()
    const endOfDay = dayjs(date).endOf('day').toDate()

    const whereClause: {
      dateTime: { gte: Date; lte: Date }
      vetId?: string
    } = {
      dateTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    }

    if (vetId) {
      whereClause.vetId = vetId
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      select: { status: true },
    })

    const overview: DailyOverview = {
      totalAppointments: appointments.length,
      scheduled: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
    }

    for (const appt of appointments) {
      if (appt.status === 'SCHEDULED') overview.scheduled++
      else if (appt.status === 'IN_PROGRESS') overview.inProgress++
      else if (appt.status === 'COMPLETED') overview.completed++
      else if (appt.status === 'CANCELLED') overview.cancelled++
    }

    return overview
  }

  async getAdminMetrics(): Promise<AdminMetrics> {
    const totalPatients = await prisma.patient.count()

    const startOfWeek = dayjs().startOf('week').toDate()
    const endOfWeek = dayjs().endOf('week').toDate()
    const appointmentsThisWeek = await prisma.appointment.count({
      where: {
        dateTime: { gte: startOfWeek, lte: endOfWeek },
      },
    })

    const startOfMonth = dayjs().startOf('month').toDate()
    const endOfMonth = dayjs().endOf('month').toDate()
    const appointmentsThisMonth = await prisma.appointment.count({
      where: {
        dateTime: { gte: startOfMonth, lte: endOfMonth },
      },
    })

    return {
      totalPatients,
      appointmentsThisWeek,
      appointmentsThisMonth,
    }
  }
}
