-- Actualizar el usuario jperez con nombre y apellido
UPDATE "Person" 
SET 
  "firstName" = 'Juan',
  "lastName" = 'Perez',
  "updatedAt" = NOW()
WHERE "username" = 'jperez';
