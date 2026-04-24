-- AlterTable
ALTER TABLE "clinics" ADD COLUMN     "address" TEXT,
ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "crmv" TEXT;

