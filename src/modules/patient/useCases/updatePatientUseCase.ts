import { Errors } from '../../../core/errors'
import type { IPatientsRepository, UpdatePatientDTO } from '../repositories/IPatientsRepository'
import type { ITutorsRepository, UpdateTutorDTO } from '../../tutor/repositories/ITutorsRepository'
import type { PatientWithTutor } from '../repositories/IPatientsRepository'

interface UpdatePatientInput extends UpdatePatientDTO {
  id: string
  clinicId: string
  tutor?: UpdateTutorDTO
}

export class UpdatePatientUseCase {
  constructor(
    private patientsRepository: IPatientsRepository,
    private tutorsRepository: ITutorsRepository,
  ) {}

  async execute({ id, clinicId, tutor, ...data }: UpdatePatientInput): Promise<PatientWithTutor> {
    const patient = await this.patientsRepository.findById(id, clinicId)
    if (!patient) throw Errors.notFound('Paciente não encontrado')

    if (tutor) {
      if (tutor.cpf && tutor.cpf !== patient.tutor.cpf) {
        const existingTutor = await this.tutorsRepository.findByCpf(tutor.cpf, patient.tutor.clinicId)
        if (existingTutor && existingTutor.id !== patient.tutorId) {
          throw Errors.conflict('CPF já cadastrado nesta clínica')
        }
      }

      if (tutor.email && tutor.email !== patient.tutor.email) {
        const existingEmail = await this.tutorsRepository.findByEmail(tutor.email, patient.tutor.clinicId)
        if (existingEmail && existingEmail.id !== patient.tutorId) {
          throw Errors.conflict('E-mail já cadastrado nesta clínica')
        }
      }

      await this.tutorsRepository.update(patient.tutorId, tutor)
    }

    await this.patientsRepository.update(id, data)

    const updatedPatient = await this.patientsRepository.findById(id, clinicId)
    if (!updatedPatient) throw Errors.notFound('Paciente não encontrado')

    const updatedTutor = await this.tutorsRepository.findById(updatedPatient.tutorId, clinicId)
    if (!updatedTutor) throw Errors.notFound('Tutor não encontrado')

    return {
      ...updatedPatient,
      tutor: updatedTutor,
    }
  }
}
