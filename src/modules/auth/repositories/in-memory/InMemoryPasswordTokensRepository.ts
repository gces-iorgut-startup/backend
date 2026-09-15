import type {
  IPasswordTokensRepository,
  PasswordToken,
  PasswordTokenType,
} from '../IPasswordTokensRepository'

export class InMemoryPasswordTokensRepository implements IPasswordTokensRepository {
  public items: PasswordToken[] = []

  async create(userId: string, token: string, expiresAt: Date, type: PasswordTokenType): Promise<void> {
    this.items.push({
      id: `token-${this.items.length + 1}`,
      userId,
      token,
      type,
      expiresAt,
      usedAt: null,
    })
  }

  async findByToken(token: string): Promise<PasswordToken | null> {
    return this.items.find(item => item.token === token) ?? null
  }

  async markAsUsed(token: string): Promise<boolean> {
    const now = new Date()
    const item = this.items.find(passwordToken =>
      passwordToken.token === token && !passwordToken.usedAt && passwordToken.expiresAt > now,
    )
    if (!item) return false
    item.usedAt = now
    return true
  }

  async invalidatePreviousTokens(userId: string, type?: PasswordTokenType): Promise<void> {
    this.items.forEach(item => {
      if (item.userId === userId && !item.usedAt && (!type || item.type === type)) {
        item.expiresAt = new Date()
      }
    })
  }
}
