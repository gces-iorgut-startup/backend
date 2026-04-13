/*
  Warnings:

  - A unique constraint covering the columns `[cpf,clinic_id]` on the table `tutors` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,clinic_id]` on the table `tutors` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "tutors_cpf_key";

-- DropIndex
DROP INDEX "tutors_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "tutors_cpf_clinic_id_key" ON "tutors"("cpf", "clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "tutors_email_clinic_id_key" ON "tutors"("email", "clinic_id");
