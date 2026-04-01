import type { IDashboardRepository, DailyOverview, AdminMetrics } from '../IDashboardRepository'

export class InMemoryDashboardRepository implements IDashboardRepository {
  async getDailyOverview(date: Date, vetId?: string): Promise<DailyOverview> {
    return {
      totalAppointments: 10,
      scheduled: 4,
      inProgress: 2,
      completed: 3,
      cancelled: 1,
    }
  }

  async getAdminMetrics(): Promise<AdminMetrics> {
    return {
      totalPatients: 150,
      appointmentsThisWeek: 45,
      appointmentsThisMonth: 120,
    }
  }
}
