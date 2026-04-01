import { AppError } from '../../../shared/errors/app-error'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '../../../config/prisma'
import { env } from '../../../config/env'

interface GenerateAISummaryRequest {
  recordId: string
}

interface GenerateAISummaryResponse {
  summary: string
}

export class GenerateAISummaryUseCase {
  async execute({ recordId }: GenerateAISummaryRequest): Promise<GenerateAISummaryResponse> {
    const record = await prisma.clinicalRecord.findUnique({
      where: { id: recordId },
      include: { patient: true, vet: true },
    })

    if (!record) {
      throw new AppError('Prontuário não encontrado.', 404)
    }

    if (!record.finalized) {
      throw new AppError('O prontuário precisa ser finalizado antes de gerar o resumo por IA.', 400)
    }

    const prompt = `
Você é um assistente de uma clínica veterinária. Analise as informações do atendimento abaixo e gere um resumo claro e simples em português brasileiro, adequado para a recepção explicar ao tutor do animal. Use linguagem acessível, sem jargões técnicos excessivos. Seja objetivo (máximo 5 parágrafos curtos).

Paciente: ${record.patient.name} (${record.patient.species}${record.patient.breed ? `, ${record.patient.breed}` : ''})
Veterinário: ${record.vet.name}
Data da consulta: ${new Date(record.createdAt).toLocaleDateString('pt-BR')}

Notas clínicas: ${record.clinicalNotes ?? 'Não informado'}
Diagnóstico: ${record.diagnosis ?? 'Não informado'}
Diagnóstico pendente: ${record.pendingDiagnosis ?? 'Nenhum'}
Prescrições: ${record.prescriptions ?? 'Nenhuma'}
Orientações de rotina: ${record.routineGuidance ?? 'Nenhuma'}
${record.weightKg ? `Peso registrado na consulta: ${record.weightKg} kg` : ''}

Gere o resumo agora:
`.trim()

    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent(prompt)
    const summary = result.response.text()

    // Persiste o resumo no prontuário
    await prisma.clinicalRecord.update({
      where: { id: recordId },
      data: { aiSummary: summary },
    })

    return { summary }
  }
}
