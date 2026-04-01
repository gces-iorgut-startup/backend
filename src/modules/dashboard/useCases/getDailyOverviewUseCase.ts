import type { IDashboardRepository, DailyOverview } from '../repositories/IDashboardRepository'
import type { IUsersRepository } from '../../auth/repositories/IUsersRepository'
import { AppError } from '../../../shared/errors/app-error'

interface GetDailyOverviewRequest {
  date: Date
  vetId: string
  userId: string
}

export class GetDailyOverviewUseCase {
  constructor(
    private dashboardRepository: IDashboardRepository,
    private usersRepository: IUsersRepository
  ) {}

  async execute({ date, vetId, userId }: GetDailyOverviewRequest): Promise<DailyOverview> {
    const requester = await this.usersRepository.findById(userId)

    if (!requester) {
      throw new AppError('Usuário não encontrado.', 404)
    }

    // Se o usuário solicitando os dados do próprio painel, vetId = userId
    // Se não, só DONO pode ver de outros vet's
    if (requester.id !== vetId && requester.role !== 'OWNER') {
      throw new AppError('Acesso negado. Apenas o proprietário pode ver os dados de outros profissionais.', 403)
    }

    return this.dashboardRepository.getDailyOverview(date, vetId)
  }
}
