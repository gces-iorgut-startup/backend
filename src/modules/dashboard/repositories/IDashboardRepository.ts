export interface DailyOverview {
  totalAppointments: number
  scheduled: number
  inProgress: number
  completed: number
  cancelled: number
}

export interface AdminMetrics {
  totalPatients: number
  appointmentsThisWeek: number
  appointmentsThisMonth: number
}

export interface IDashboardRepository {
  getDailyOverview(date: Date, vetId?: string): Promise<DailyOverview>
  getAdminMetrics(): Promise<AdminMetrics>
}
