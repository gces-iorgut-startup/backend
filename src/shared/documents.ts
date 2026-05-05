import { isValidCpf as libValidCpf, isValidCnpj as libValidCnpj } from '@brazilian-utils/brazilian-utils'

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function isValidCpf(value: string): boolean {
  return libValidCpf(value)
}

export function isValidCnpj(value: string): boolean {
  return libValidCnpj(value)
}
