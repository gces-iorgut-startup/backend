-- Adiciona campos cadastrais da clínica (US10 — cabeçalho do receituário)
ALTER TABLE "clinics"
  ADD COLUMN "cnpj" TEXT,
  ADD COLUMN "address" TEXT,
  ADD COLUMN "phone" TEXT;

-- Adiciona CRMV no cadastro de médicos veterinários (US10 — assinatura do receituário)
ALTER TABLE "users"
  ADD COLUMN "crmv" TEXT;
