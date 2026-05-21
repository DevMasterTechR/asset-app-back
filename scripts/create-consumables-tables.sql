-- Script para crear tablas de consumibles/periféricos que faltan
-- Ejecutar en Supabase SQL Editor

-- 1. Crear tabla Ink si no existe
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

-- 2. Crear tabla UtpCable si no existe
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

-- 3. Crear tabla Rj45Connector si no existe
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
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Crear tabla PowerStrip si no existe
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
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Crear tabla Mouse si no existe
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
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Crear tabla Keyboard si no existe
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
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Crear tabla MousePad si no existe
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
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. Crear tabla MemoryAdapter si no existe
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
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Crear tabla Hub si no existe
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
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. Crear tabla NetworkAdapter si no existe
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
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. Crear tabla Support si no existe
CREATE TABLE IF NOT EXISTS "Support" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "type" TEXT,
  "color" TEXT,
  "brand" TEXT,
  "model" TEXT,
  "purchaseDate" TIMESTAMP(3),
  "usageDate" TIMESTAMP(3),
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Verificación: listar tablas creadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('Ink', 'UtpCable', 'Rj45Connector', 'PowerStrip', 'Mouse', 'Keyboard', 'MousePad', 'MemoryAdapter', 'Hub', 'NetworkAdapter', 'Support')
ORDER BY table_name;
