export type PasswordTokenType = 'FIRST_ACCESS' | 'RECOVERY'

export interface PasswordToken {
  id: string
  token: string
  userId: string
  type: PasswordTokenType
  expiresAt: Date
  usedAt?: Date | null
}

export interface IPasswordTokensRepository {
  create(userId: string, token: string, expiresAt: Date, type: PasswordTokenType): Promise<void>
  findByToken(token: string): Promise<PasswordToken | null>
  /** Marca o token como usado apenas se ainda estiver pendente e no prazo; retorna false caso contrário. */
  markAsUsed(token: string): Promise<boolean>
  /**
   * Expira os tokens pendentes sem preencher `usedAt`, que indica apenas consumo real.
   * Sem `type`, invalida os tokens pendentes de todos os tipos.
   */
  invalidatePreviousTokens(userId: string, type?: PasswordTokenType): Promise<void>
}
