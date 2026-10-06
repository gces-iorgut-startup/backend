-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'PENDING_APPROVAL';
ALTER TYPE "AppointmentStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "appointments" ALTER COLUMN "vet_id" DROP NOT NULL;

-- AddCheckConstraint
ALTER TABLE "appointments"
  ADD CONSTRAINT "check_vet_id_status"
  CHECK (
    ("status" IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED') AND "vet_id" IS NOT NULL)
    OR ("status" NOT IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED'))
  );
