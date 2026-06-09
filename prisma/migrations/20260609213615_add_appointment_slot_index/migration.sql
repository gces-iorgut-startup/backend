-- CreateIndex
CREATE INDEX "appointments_vet_id_date_time_idx" ON "appointments"("vet_id", "date_time");

-- Partial unique index: prevents concurrent double-booking for the same vet at the same start time (active appointments only)
CREATE UNIQUE INDEX "unique_vet_active_slot"
  ON "appointments" ("vet_id", "date_time")
  WHERE status != 'CANCELLED';
