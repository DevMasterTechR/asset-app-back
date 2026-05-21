-- =====================================================================
-- SCRIPT COMPLETO: Reparación/Creación de todas las tablas y estructura
-- Ejecutar en Supabase SQL Editor
-- SEGURO: Usa IF NOT EXISTS / ADD COLUMN IF NOT EXISTS
-- =====================================================================

-- 1. Crear enums si no existen
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AssetStatus') THEN
    CREATE TYPE "AssetStatus" AS ENUM ('available', 'assigned', 'loaned', 'maintenance', 'decommissioned', 'ti');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PersonStatus') THEN
    CREATE TYPE "PersonStatus" AS ENUM ('active', 'inactive', 'suspended');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StorageType') THEN
    CREATE TYPE "StorageType" AS ENUM ('SSD', 'HDD', 'M2', 'NVMe', 'eMMC', 'Soldered', 'Other');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Condition') THEN
    CREATE TYPE "Condition" AS ENUM ('excellent', 'good', 'fair', 'poor');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SystemType') THEN
    CREATE TYPE "SystemType" AS ENUM ('email', 'glpi', 'erp', 'crm', 'tefl', 'phone');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SimPlanType') THEN
    CREATE TYPE "SimPlanType" AS ENUM ('prepago', 'postpago', 'corporativo');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SimStatus') THEN
    CREATE TYPE "SimStatus" AS ENUM ('activo', 'inactivo', 'suspendido');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ActaStatus') THEN
    CREATE TYPE "ActaStatus" AS ENUM ('no_generada', 'acta_generada', 'firmada');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RequestType') THEN
    CREATE TYPE "RequestType" AS ENUM ('equipment_replacement', 'consumables', 'equipment_request', 'new_employee');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RequestStatus') THEN
    CREATE TYPE "RequestStatus" AS ENUM ('pendiente_rrhh', 'rrhh_rechazada', 'pendiente_admin', 'aceptada', 'rechazada');
  END IF;
END $$;

-- 2. Crear tablas base si no existen
CREATE TABLE IF NOT EXISTS "Branch" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "address" TEXT,
  "region" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Department" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT
);

CREATE TABLE IF NOT EXISTS "Role" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT
);

CREATE TABLE IF NOT EXISTS "Person" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "nationalId" TEXT NOT NULL UNIQUE,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "username" TEXT UNIQUE,
  "password" TEXT,
  "status" "PersonStatus" NOT NULL DEFAULT 'active',
  "departmentId" INTEGER,
  "roleId" INTEGER,
  "branchId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "currentToken" TEXT,
  "lastActivityAt" TIMESTAMP(3),
  "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
  "observation" TEXT,
  "tiAssetIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  CONSTRAINT "Person_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id"),
  CONSTRAINT "Person_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id"),
  CONSTRAINT "Person_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id")
);

CREATE TABLE IF NOT EXISTS "Asset" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "assetCode" TEXT NOT NULL UNIQUE,
  "assetType" TEXT NOT NULL,
  "serialNumber" TEXT UNIQUE,
  "brand" TEXT,
  "model" TEXT,
  "purchasePrice" DOUBLE PRECISION,
  "status" "AssetStatus" NOT NULL DEFAULT 'available',
  "branchId" INTEGER,
  "assignedPersonId" INTEGER,
  "purchaseDate" TIMESTAMP(3),
  "deliveryDate" TIMESTAMP(3),
  "receivedDate" TIMESTAMP(3),
  "notes" TEXT,
  "attributesJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Asset_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id"),
  CONSTRAINT "Asset_assignedPersonId_fkey" FOREIGN KEY ("assignedPersonId") REFERENCES "Person" ("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "StorageCapacity" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "assetId" INTEGER NOT NULL,
  "type" "StorageType" NOT NULL,
  "capacityGb" INTEGER NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StorageCapacity_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id")
);

CREATE TABLE IF NOT EXISTS "AssignmentHistory" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "assetId" INTEGER NOT NULL,
  "personId" INTEGER NOT NULL,
  "branchId" INTEGER,
  "parentAssignmentId" INTEGER,
  "assignmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "returnDate" TIMESTAMP(3),
  "deliveryCondition" "Condition" NOT NULL DEFAULT 'good',
  "returnCondition" "Condition",
  "deliveryNotes" TEXT,
  "returnNotes" TEXT,
  "actaStatus" "ActaStatus" NOT NULL DEFAULT 'no_generada',
  "actaFirmadaAt" TIMESTAMP(3),
  "actaRecepcionStatus" "ActaStatus" NOT NULL DEFAULT 'no_generada',
  "actaRecepcionFirmadaAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AssignmentHistory_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id"),
  CONSTRAINT "AssignmentHistory_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id"),
  CONSTRAINT "AssignmentHistory_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id"),
  CONSTRAINT "AssignmentHistory_parentAssignmentId_fkey" FOREIGN KEY ("parentAssignmentId") REFERENCES "AssignmentHistory" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- 3. Crear tablas de consumibles/periféricos
CREATE TABLE IF NOT EXISTS "Ink" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "brand" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "color" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 0,
  "inkType" TEXT,
  "purchasePrice" DOUBLE PRECISION,
  "purchaseDate" TIMESTAMP(3),
  "usageDate" TIMESTAMP(3),
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "UtpCable" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "brand" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "material" TEXT,
  "lengthMeters" NUMERIC,
  "color" TEXT,
  "purchasePrice" DOUBLE PRECISION,
  "purchaseDate" TIMESTAMP(3),
  "usageDate" TIMESTAMP(3),
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Rj45Connector" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "model" TEXT NOT NULL,
  "quantityUnits" INTEGER NOT NULL DEFAULT 0,
  "material" TEXT,
  "type" TEXT,
  "purchasePrice" DOUBLE PRECISION,
  "purchaseDate" TIMESTAMP(3),
  "usageDate" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "PowerStrip" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "brand" TEXT,
  "model" TEXT NOT NULL,
  "outletCount" INTEGER,
  "lengthMeters" NUMERIC,
  "color" TEXT,
  "capacity" INTEGER,
  "purchasePrice" DOUBLE PRECISION,
  "purchaseDate" TIMESTAMP(3),
  "usageDate" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Mouse" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "brand" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "connectionType" TEXT,
  "dpi" INTEGER,
  "color" TEXT,
  "purchaseDate" TIMESTAMP(3),
  "usageDate" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Keyboard" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "brand" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "connectionType" TEXT,
  "layout" TEXT,
  "language" TEXT,
  "isNumeric" BOOLEAN NOT NULL DEFAULT false,
  "color" TEXT,
  "purchaseDate" TIMESTAMP(3),
  "usageDate" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "MousePad" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "brand" TEXT,
  "model" TEXT,
  "material" TEXT,
  "size" TEXT,
  "color" TEXT,
  "purchaseDate" TIMESTAMP(3),
  "usageDate" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "MemoryAdapter" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "brand" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "adapterType" TEXT,
  "compatibility" TEXT,
  "speed" TEXT,
  "color" TEXT,
  "purchaseDate" TIMESTAMP(3),
  "usageDate" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Hub" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "brand" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "portCount" INTEGER,
  "usbType" TEXT,
  "color" TEXT,
  "purchaseDate" TIMESTAMP(3),
  "usageDate" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "NetworkAdapter" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "brand" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "speed" TEXT,
  "connectionType" TEXT,
  "color" TEXT,
  "purchaseDate" TIMESTAMP(3),
  "usageDate" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Support" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "type" TEXT,
  "color" TEXT,
  "brand" TEXT,
  "model" TEXT,
  "purchaseDate" TIMESTAMP(3),
  "usageDate" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Loan" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "assetId" INTEGER NOT NULL,
  "personId" INTEGER NOT NULL,
  "branchId" INTEGER,
  "loanDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "returnDate" TIMESTAMP(3),
  "loanDays" INTEGER NOT NULL,
  "deliveryCondition" "Condition" NOT NULL DEFAULT 'good',
  "returnCondition" "Condition",
  "deliveryNotes" TEXT,
  "returnNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Loan_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id"),
  CONSTRAINT "Loan_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id"),
  CONSTRAINT "Loan_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id")
);

CREATE TABLE IF NOT EXISTS "Credential" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "personId" INTEGER NOT NULL,
  "username" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "system" "SystemType" NOT NULL,
  "phone" VARCHAR(200),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Credential_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id")
);

CREATE TABLE IF NOT EXISTS "SimCard" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "assetId" INTEGER NOT NULL,
  "carrier" TEXT NOT NULL,
  "phoneNumber" TEXT NOT NULL UNIQUE,
  "planType" "SimPlanType" NOT NULL,
  "status" "SimStatus" NOT NULL DEFAULT 'activo',
  "activationDate" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SimCard_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id")
);

CREATE TABLE IF NOT EXISTS "Request" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "personId" INTEGER NOT NULL,
  "type" "RequestType" NOT NULL,
  "status" "RequestStatus" NOT NULL DEFAULT 'pendiente_rrhh',
  "payload" JSONB,
  "hrReason" TEXT,
  "adminReason" TEXT,
  "hrReviewerId" INTEGER,
  "adminReviewerId" INTEGER,
  "hrSeenAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Request_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id"),
  CONSTRAINT "Request_hrReviewerId_fkey" FOREIGN KEY ("hrReviewerId") REFERENCES "Person" ("id"),
  CONSTRAINT "Request_adminReviewerId_fkey" FOREIGN KEY ("adminReviewerId") REFERENCES "Person" ("id")
);

-- 4. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS "idx_assignment_asset" ON "AssignmentHistory"("assetId");
CREATE INDEX IF NOT EXISTS "idx_assignment_person" ON "AssignmentHistory"("personId");
CREATE INDEX IF NOT EXISTS "idx_assignment_parent" ON "AssignmentHistory"("parentAssignmentId");
CREATE INDEX IF NOT EXISTS "idx_asset_branch" ON "Asset"("branchId");
CREATE INDEX IF NOT EXISTS "idx_asset_status" ON "Asset"("status");
CREATE INDEX IF NOT EXISTS "idx_person_branch" ON "Person"("branchId");
CREATE INDEX IF NOT EXISTS "idx_credential_person" ON "Credential"("personId");
CREATE INDEX IF NOT EXISTS "idx_sim_asset" ON "SimCard"("assetId");

-- 5. Crear tabla de migraciones de Prisma si no existe
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id" VARCHAR(36) NOT NULL PRIMARY KEY,
  "checksum" VARCHAR(64) NOT NULL,
  "finished_at" TIMESTAMP(3),
  "migration_name" VARCHAR(255) NOT NULL,
  "logs" TEXT,
  "rolled_back_at" TIMESTAMP(3),
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

-- Mensaje de confirmación
SELECT 'ÉXITO: Base de datos reparada/creada completamente' AS resultado;
