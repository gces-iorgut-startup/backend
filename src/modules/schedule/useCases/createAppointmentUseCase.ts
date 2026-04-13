import { Errors } from '../../../core/errors'
import type { IAppointmentsRepository, CreateAppointmentDTO } from '../repositories/IAppointmentsRepository'
import type { IPatientsRepository } from '../../patient/repositories/IPatientsRepository'
import type { IUsersRepository } from '../../auth/repositories/IUsersRepository'
import type { Appointment } from '@prisma/client'

interface CreateAppointmentRequest extends CreateAppointmentDTO {
  clinicId: string
}

export class CreateAppointmentUseCase {
  constructor(
    private appointmentsRepository: IAppointmentsRepository,
    private patientsRepository: IPatientsRepository,
    private usersRepository: IUsersRepository,
  ) {}

  async execute(input: CreateAppointmentRequest): Promise<Appointment> {
    const [patient, vet] = await Promise.all([
      this.patientsRepository.findById(input.patientId, input.clinicId),
      this.usersRepository.findById(input.vetId),
    ])

    if (!patient) throw Errors.notFound('Paciente não encontrado')
    if (!vet) throw Errors.notFound('Veterinário não encontrado')

    return this.appointmentsRepository.create(input)
  }
}
