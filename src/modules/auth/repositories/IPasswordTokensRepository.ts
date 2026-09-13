export interface PasswordToken {
  id: string
  token: string
  userId: string
  expiresAt: Date
  usedAt?: Date | null
}

export interface IPasswordTokensRepository {
  create(userId: string, token: string, expiresAt: Date): Promise<void>
  findByToken(token: string): Promise<PasswordToken | null>
  markAsUsed(token: string): Promise<void>
  invalidatePreviousTokens(userId: string): Promise<void>
}