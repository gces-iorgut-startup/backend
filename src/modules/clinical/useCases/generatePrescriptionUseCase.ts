import PDFDocument from 'pdfkit'
import { AppError } from '../../../shared/errors/app-error'
import { prisma } from '../../../config/prisma'

interface GeneratePrescriptionRequest {
  recordId: string
}

export class GeneratePrescriptionUseCase {
  async execute({ recordId }: GeneratePrescriptionRequest): Promise<Buffer> {
    const record = await prisma.clinicalRecord.findUnique({
      where: { id: recordId },
      include: {
        patient: true,
        vet: true,
      },
    })

    if (!record) {
      throw new AppError('Prontuário não encontrado.', 404)
    }

    if (!record.finalized) {
      throw new AppError('O prontuário precisa ser finalizado antes de emitir a receita.', 400)
    }

    if (!record.prescriptions) {
      throw new AppError('Este prontuário não possui prescrições registradas.', 400)
    }

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' })
      const chunks: Buffer[] = []

      doc.on('data', (chunk: Buffer) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // ── Cabeçalho ──────────────────────────────────────
      doc.fontSize(20).font('Helvetica-Bold').text('IOUGURT', { align: 'center' })
      doc.fontSize(10).font('Helvetica').text('Clínica Veterinária', { align: 'center' })
      doc.moveDown(0.5)
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
      doc.moveDown(0.5)

      // ── Dados do Paciente ───────────────────────────────
      doc.fontSize(12).font('Helvetica-Bold').text('RECEITUÁRIO VETERINÁRIO')
      doc.moveDown(0.5)

      doc.fontSize(10).font('Helvetica')
      doc.text(`Paciente: ${record.patient.name}`)
      doc.text(`Espécie: ${record.patient.species}`)
      if (record.patient.breed) doc.text(`Raça: ${record.patient.breed}`)
      doc.text(`Data: ${new Date(record.createdAt).toLocaleDateString('pt-BR')}`)
      doc.moveDown(0.5)

      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
      doc.moveDown(0.5)

      // ── Prescrições ─────────────────────────────────────
      doc.fontSize(11).font('Helvetica-Bold').text('Prescrições:')
      doc.moveDown(0.3)
      doc.fontSize(10).font('Helvetica').text(record.prescriptions ?? '', {
        width: 495,
        align: 'left',
      })
      doc.moveDown(1)

      // ── Orientações ─────────────────────────────────────
      if (record.routineGuidance) {
        doc.fontSize(11).font('Helvetica-Bold').text('Orientações ao Tutor:')
        doc.moveDown(0.3)
        doc.fontSize(10).font('Helvetica').text(record.routineGuidance, {
          width: 495,
          align: 'left',
        })
        doc.moveDown(1)
      }

      // ── Assinatura ──────────────────────────────────────
      doc.moveDown(2)
      doc.moveTo(200, doc.y).lineTo(400, doc.y).stroke()
      doc.moveDown(0.3)
      doc.fontSize(10).font('Helvetica').text(`Dr(a). ${record.vet.name}`, { align: 'center' })
      doc.text('Médico(a) Veterinário(a)', { align: 'center' })

      doc.end()
    })
  }
}
