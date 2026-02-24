DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'AssetStatus' AND e.enumlabel = 'ti'
  ) THEN
    ALTER TYPE "AssetStatus" ADD VALUE 'ti';
  END IF;
END $$;

ALTER TABLE "Person"
  ADD COLUMN IF NOT EXISTS "observation" TEXT,
  ADD COLUMN IF NOT EXISTS "tiAssetIds" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[];
