/** Mesmo contrato do frontend (`frontend/src/lib/clinicalRecordContent.ts`). */
const ROUTINE_GUIDANCE_META_PREFIX = '__IOUGURT_META__:'

export function parseRoutineGuidanceMeta(value?: string | null): {
  observations: string
  additionalObservations: string
} {
  if (!value) {
    return { observations: '', additionalObservations: '' }
  }

  if (value.startsWith(ROUTINE_GUIDANCE_META_PREFIX)) {
    try {
      const parsed = JSON.parse(value.slice(ROUTINE_GUIDANCE_META_PREFIX.length)) as {
        observations?: string
        additionalObservations?: string
      }
      return {
        observations: parsed.observations ?? '',
        additionalObservations: parsed.additionalObservations ?? '',
      }
    } catch {
      return { observations: '', additionalObservations: value }
    }
  }

  return { observations: '', additionalObservations: value }
}

/** Texto legível para PDF / impressão (sem JSON nem prefixo interno). */
export function routineGuidanceToPlainText(value?: string | null): string {
  const { observations, additionalObservations } = parseRoutineGuidanceMeta(value)
  const parts: string[] = []
  if (observations.trim()) parts.push(observations.trim())
  if (additionalObservations.trim()) parts.push(additionalObservations.trim())
  return parts.join('\n\n')
}
