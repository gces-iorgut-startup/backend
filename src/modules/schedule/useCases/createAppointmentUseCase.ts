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
    const { clinicId, ...appointmentData } = input
    const [patient, vet] = await Promise.all([
      this.patientsRepository.findById(input.patientId, clinicId),
      this.usersRepository.findById(input.vetId),
    ])

    if (!patient) throw Errors.notFound('Paciente não encontrado')
    if (!vet) throw Errors.notFound('Veterinário não encontrado')
    if (vet.clinicId !== clinicId) throw Errors.notFound('Veterinário não encontrado')

    if (input.endDateTime && input.endDateTime <= input.dateTime) {
      throw Errors.badRequest('O horário de fim deve ser posterior ao horário de início.')
    }

    const effectiveEnd = input.endDateTime ?? new Date(input.dateTime.getTime() + 15 * 60 * 1000)
    const conflict = await this.appointmentsRepository.findConflict(input.vetId, input.dateTime, effectiveEnd)
    if (conflict) throw Errors.conflict('Este horário já está ocupado.')

    return this.appointmentsRepository.create(appointmentData)
  }
}
