import type { IHashProvider } from '../../providers/IHashProvider'
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export class BcryptHashProvider implements IHashProvider {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS)
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed)
  }
}
