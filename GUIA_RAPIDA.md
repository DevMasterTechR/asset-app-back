# 📧 Sistema de Notificaciones por Email - Guía Rápida

## ¿Qué se implementó?

Cuando un usuario crea una **nueva solicitud de Recursos Humanos** (RRH), se envía automáticamente un **correo profesional y formal** a:

📧 **Destinatario**: `genericosistem@gmail.com` (RRHH)  
📤 **Remitente**: `genericosistem2@gmail.com`  

---

## 📧 ¿Cómo se ve el correo?

El correo incluye:

1. **Encabezado profesional** con el título "Nueva Solicitud de Recursos Humanos"
2. **Alerta visual** indicando que se requiere acción
3. **Información general**:
   - Código único de solicitud (ej: SOL-20251226-0001)
   - Nombre del solicitante
   - Tipo de solicitud
   - Fecha y hora
4. **Detalles específicos** según el tipo de solicitud:
   - Para nuevo empleado: datos personales, puesto, departamento, etc.
   - Para equipos: descripción, cantidad, justificación
   - Para consumibles: tipo, cantidad, descripción
5. **Pie de página** profesional

---

## 🔧 ¿Cómo configurarlo?

### Paso 1: Habilitar Verificación en Dos Pasos
1. Ir a https://myaccount.google.com/
2. Click en "Seguridad" en el menú izquierdo
3. Buscar "Verificación en dos pasos" y habilitar

### Paso 2: Generar Contraseña de Aplicación
1. Ir a https://myaccount.google.com/apppasswords
2. Seleccionar:
   - App: **Correo**
   - Dispositivo: **Windows** (o tu sistema operativo)
3. Google generará 16 caracteres → **COPIA ESTO**

### Paso 3: Configurar el Backend
En la carpeta `asset-app-back`, en el archivo `.env` (o crear uno basado en `.env.example.email`), agregar:

```env
EMAIL_USER=genericosistem2@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx   # Pega la contraseña de 16 caracteres
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM=genericosistem2@gmail.com
HR_NOTIFICATION_EMAIL=genericosistem@gmail.com
```

### Paso 4: Reiniciar el Servidor
```bash
pnpm start:dev
```

---

## ✅ ¿Cómo verificar que funciona?

1. **Crea una solicitud** a través del frontend o API
2. **Espera 1 minuto**
3. **Revisa el email** en `genericosistem@gmail.com`

Si no llega:
- Verifica el archivo `.env` tenga todas las variables
- Revisa los logs del servidor buscando "Email"
- Asegúrate que la contraseña sea la de **aplicación** (no la regular)

---

## 📁 Archivos Importantes

### Creados:
- `src/common/services/email.service.ts` - Motor de notificaciones
- `EMAIL_CONFIG.md` - Documentación completa (ver si necesitas ayuda)
- `IMPLEMENTATION_SUMMARY.md` - Resumen técnico detallado
- `.env.example.email` - Ejemplo de variables de entorno
- `example_request.sql` - Ejemplos SQL

### Modificados:
- `src/requests/requests.service.ts` - Ahora envía email al crear solicitud
- `src/requests/requests.module.ts` - Agregó el servicio de email

---

## 🔄 ¿Cuándo se envía el email?

El email se envía **automáticamente** cuando:

1. Un usuario crea una solicitud → Estado: `pendiente_rrhh`
   - ✅ Se envía email a RRHH

2. RRHH aprueba → Estado: `pendiente_admin`
   - (Sin email adicional por ahora)

3. Admin aprueba → Estado: `aceptada`
   - (Sin email adicional por ahora)

---

## 🎯 Ejemplo: Crear una Solicitud

### Usando la API:

```bash
POST /requests
Authorization: Bearer [tu_token_jwt]
Content-Type: application/json

{
  "type": "new_employee",
  "payload": {
    "firstName": "Carlos",
    "lastName": "García",
    "nationalId": "40123456789",
    "phone": "8095551234",
    "position": "Ingeniero Senior",
    "branchId": "1",
    "departmentId": "2",
    "notes": "Nuevo empleado para equipo de desarrollo"
  }
}
```

**Respuesta esperada**:
```json
{
  "id": 1,
  "code": "SOL-20251226-0001",
  "personId": 1,
  "type": "new_employee",
  "status": "pendiente_rrhh",
  "payload": { ... },
  "createdAt": "2025-12-26T12:00:00Z",
  ...
}
```

Y automáticamente... ✉️ **¡El email se envía a RRHH!**

---

## 🆘 Solucionar Problemas

### "El email no se envía"
1. ✅ Verifica que `.env` tenga todas las variables
2. ✅ Verifica que `EMAIL_PASSWORD` sea la contraseña de **aplicación** (16 caracteres)
3. ✅ Verifica que la verificación en dos pasos está **habilitada** en Google
4. ✅ Intenta crear la contraseña de aplicación de nuevo

### "Error de conexión SMTP"
- Verifica que el puerto 587 no está bloqueado (firewall)
- Intenta cambiar `EMAIL_PORT=465` y `EMAIL_SECURE=true` si usas SSL

### "Error de autenticación"
- Verifica que `EMAIL_USER` sea el email completo: `genericosistem2@gmail.com`
- Verifica que `EMAIL_PASSWORD` sea sin espacios en el código

---

## 📞 Variables de Entorno (Referencia)

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `EMAIL_USER` | genericosistem2@gmail.com | Email que envía |
| `EMAIL_PASSWORD` | [16 caracteres] | Contraseña de aplicación de Google |
| `EMAIL_HOST` | smtp.gmail.com | Servidor SMTP de Gmail |
| `EMAIL_PORT` | 587 | Puerto SMTP (TLS) |
| `EMAIL_SECURE` | false | Usar TLS (false) o SSL (true) |
| `EMAIL_FROM` | genericosistem2@gmail.com | Mostrar como remitente |
| `HR_NOTIFICATION_EMAIL` | genericosistem@gmail.com | Donde llega la notificación |

---

## 🚀 ¡Listo!

Eso es todo. Una vez configurado, el sistema trabajará automáticamente:

- ✅ Usuario crea solicitud
- ✅ Sistema envía email formal a RRHH
- ✅ RRHH recibe notificación con toda la información
- ✅ RRHH puede aprobar/rechazar la solicitud

---

**Fecha**: 26 de Diciembre, 2025  
**Estado**: ✅ Listo para usar
