import type { IDashboardRepository, AdminMetrics } from '../repositories/IDashboardRepository'
import type { IUsersRepository } from '../../auth/repositories/IUsersRepository'
import { AppError } from '../../../shared/errors/app-error'

interface GetAdminMetricsRequest {
  userId: string
}

export class GetAdminMetricsUseCase {
  constructor(
    private dashboardRepository: IDashboardRepository,
    private usersRepository: IUsersRepository
  ) {}

  async execute({ userId }: GetAdminMetricsRequest): Promise<AdminMetrics> {
    const requester = await this.usersRepository.findById(userId)

    if (!requester) {
      throw new AppError('Usuário não encontrado.', 404)
    }

    if (requester.role !== 'OWNER') {
      throw new AppError('Acesso restrito. Apenas administradores (donos) podem acessar essas métricas.', 403)
    }

    return this.dashboardRepository.getAdminMetrics()
  }
}
