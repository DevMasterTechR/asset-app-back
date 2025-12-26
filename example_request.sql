-- =====================================================
-- EJEMPLO DE SOLICITUD CREADA EN LA BASE DE DATOS
-- =====================================================

-- Cuando se crea una solicitud, se guarda en la tabla request con la siguiente estructura:

INSERT INTO "Request" (code, "personId", type, status, payload, "createdAt", "updatedAt")
VALUES 
  (
    'SOL-20251226-0001',
    1,  -- ID de la persona que solicita
    'new_employee',
    'pendiente_rrhh',
    '{
      "firstName": "Carlos",
      "lastName": "García",
      "nationalId": "40123456789",
      "phone": "8095551234",
      "position": "Ingeniero de Sistemas",
      "branchId": "1",
      "departmentId": "2",
      "notes": "Nuevo empleado para el equipo de desarrollo"
    }'::json,
    NOW(),
    NOW()
  );

-- El flujo de la solicitud sería el siguiente:
-- 1. Solicitud creada → Estado: pendiente_rrhh
--    - Se envía email a RRHH (genericosistem@gmail.com)
--    - Asunto: "Nueva Solicitud de Recursos Humanos - SOL-20251226-0001"

-- 2. RRHH revisa y aprueba → Estado: pendiente_admin
--    UPDATE "Request" 
--    SET status = 'pendiente_admin', 
--        "hrReviewerId" = 2,  -- ID del revisor de RRHH
--        "hrReason" = 'Documentación completa, recomendado'
--    WHERE id = 1;

-- 3. Admin revisa y aprueba → Estado: aceptada
--    UPDATE "Request" 
--    SET status = 'aceptada', 
--        "adminReviewerId" = 3  -- ID del revisor admin
--    WHERE id = 1;

-- Alternativa: RRHH rechaza la solicitud → Estado: rrhh_rechazada
--    UPDATE "Request" 
--    SET status = 'rrhh_rechazada', 
--        "hrReviewerId" = 2,
--        "hrReason" = 'Documentación incompleta'
--    WHERE id = 1;

-- Los tipos de solicitud disponibles son:
-- - 'equipment_replacement' : Reemplazo de Equipo
-- - 'consumables' : Consumibles
-- - 'equipment_request' : Solicitud de Equipo
-- - 'new_employee' : Nuevo Empleado

-- Los estados disponibles son:
-- - 'pendiente_rrhh' : Esperando revisión de RRHH
-- - 'rrhh_rechazada' : Rechazado por RRHH
-- - 'pendiente_admin' : Esperando revisión de Admin
-- - 'aceptada' : Aceptado por Admin
-- - 'rechazada' : Rechazado por Admin
