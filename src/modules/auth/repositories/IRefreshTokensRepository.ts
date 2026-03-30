export interface CreateRefreshTokenDTO {
  token: string
  userId: string
  expiresAt: Date
}

export interface RefreshTokenDTO {
  id: string
  token: string
  userId: string
  expiresAt: Date
  createdAt: Date
}

export interface IRefreshTokensRepository {
  create(data: CreateRefreshTokenDTO): Promise<RefreshTokenDTO>
  findByToken(token: string): Promise<RefreshTokenDTO | null>
  deleteByToken(token: string): Promise<void>
  deleteAllByUserId(userId: string): Promise<void>
}
