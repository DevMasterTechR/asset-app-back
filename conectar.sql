SELECT * FROM public."Person"

SELECT * FROM public."Asset"

SELECT * FROM public."AssignmentHistory"

SELECT * FROM public."Department"

SELECT * FROM public."StorageCapacity"

SELECT * FROM public."SimCard"


SELECT * FROM public."Role"

SELECT * FROM public."PowerStrip"

SELECT * FROM public."Request"

SELECT * FROM public._prisma_migrations


INSERT INTO public."Person" (
    "nationalId", 
    "firstName", 
    "lastName", 
    "username", 
    "password", 
    "status", 
    "departmentId", 
    "roleId", 
    "branchId",
    "mustChangePassword",
    "createdAt",
    "updatedAt"
) VALUES 
(
    '12345678',
    'Bryan',
    'Quispe',
    'brquispe',
    'supersegura123',  -- Cambia este hash
    'active',
    (SELECT id FROM public."Department" WHERE name = 'IT' LIMIT 1),
    (SELECT id FROM public."Role" WHERE name = 'admin' LIMIT 1),
    (SELECT id FROM public."Branch" WHERE name = 'Sucursal Central' LIMIT 1),
    true,  -- Debe cambiar contraseña en primer login
    NOW(),
    NOW()
);