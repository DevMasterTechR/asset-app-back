-- Regenerar códigos de solicitudes existentes con formato SOL-YYYYMMDD-XXXX
-- Formato: SOL-YYYYMMDD-XXXX donde XXXX es el número secuencial global (0001, 0002, etc)

WITH numbered_requests AS (
  SELECT 
    r.id,
    r.code,
    r."createdAt",
    ROW_NUMBER() OVER (ORDER BY r."createdAt" ASC, r.id ASC) as seq_num
  FROM "Request" r
)
UPDATE "Request" r
SET code = 'SOL-' || TO_CHAR(nr."createdAt", 'YYYYMMDD') || '-' || LPAD(nr.seq_num::text, 4, '0')
FROM numbered_requests nr
WHERE r.id = nr.id;
