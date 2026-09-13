import type { IPasswordTokensRepository, PasswordToken } from '../IPasswordTokensRepository'

export class InMemoryPasswordTokensRepository implements IPasswordTokensRepository {
  public items: PasswordToken[] = []

  async create(userId: string, token: string, expiresAt: Date): Promise<void> {
    this.items.push({
      id: `token-${this.items.length + 1}`,
      userId,
      token,
      expiresAt,
      usedAt: null,
    })
  }

  async findByToken(token: string): Promise<PasswordToken | null> {
    return this.items.find(item => item.token === token) ?? null
  }

  async markAsUsed(token: string): Promise<void> {
    const item = this.items.find(passwordToken => passwordToken.token === token)
    if (item) item.usedAt = new Date()
  }

  async invalidatePreviousTokens(userId: string): Promise<void> {
    this.items.forEach(item => {
      if (item.userId === userId && !item.usedAt) {
        item.usedAt = new Date()
      }
    })
  }
}
