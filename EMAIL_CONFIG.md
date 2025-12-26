# 📧 Configuración de Notificaciones por Email - RRHH

## Descripción

Se ha implementado un sistema de notificaciones por email automático que envía una notificación formal a RRHH (`genericosistem@gmail.com`) cada vez que se crea una nueva solicitud de recursos humanos.

El correo se envía desde `genericosistem2@gmail.com` con un formato profesional y detallado que incluye toda la información de la solicitud.

---

## 📋 Requisitos Previos

- Una cuenta de Google activa (en este caso, `genericosistem2@gmail.com`)
- Tener habilitada la verificación en dos pasos en la cuenta de Google
- Acceso a https://myaccount.google.com/apppasswords

---

## 🔧 Pasos de Configuración

### 1. Habilitar Verificación en Dos Pasos

1. Ir a https://myaccount.google.com/
2. En el panel izquierdo, hacer clic en "Seguridad"
3. Buscar "Verificación en dos pasos"
4. Seguir los pasos para habilitarla (puede usar tu teléfono)

### 2. Generar Contraseña de Aplicación

1. Una vez habilitada la verificación en dos pasos, ir nuevamente a:
   https://myaccount.google.com/apppasswords

2. Seleccionar:
   - **App**: "Correo"
   - **Dispositivo**: "Windows (o tu sistema operativo)"

3. Google generará una contraseña de 16 caracteres. **Esta es la que usaremos**.

4. Copiar esa contraseña (sin espacios)

### 3. Configurar Variables de Entorno

En el backend (`asset-app-back`), añadir o actualizar las siguientes variables en tu archivo `.env`:

```env
# Email desde el cual se enviarán las notificaciones
EMAIL_USER=genericosistem2@gmail.com

# Contraseña de aplicación generada en Google
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # (copia tu contraseña de 16 caracteres)

# Configuración SMTP para Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false

# Email de origen para mostrar en el correo
EMAIL_FROM=genericosistem2@gmail.com

# Email que recibirá las notificaciones de RRHH
HR_NOTIFICATION_EMAIL=genericosistem@gmail.com
```

### 4. Instalar Dependencias (si aún no están)

El proyecto ya tiene `@nestjs-modules/mailer` y `nodemailer` en las dependencias.
Si necesitas instalar manualmente:

```bash
pnpm install nodemailer
pnpm install -D @types/nodemailer
```

---

## 📧 Estructura del Email Enviado

Cuando se crea una nueva solicitud, el email incluye:

### Encabezado
- Título: "Nueva Solicitud de Recursos Humanos"
- Alerta visual indicando que se requiere acción

### Información General
- **Código de Solicitud**: Identificador único (ej: SOL-20251226-0001)
- **Solicitante**: Nombre completo de la persona que hace la solicitud
- **Tipo de Solicitud**: 
  - Nuevo Empleado
  - Reemplazo de Equipo
  - Solicitud de Equipo
  - Consumibles
- **Fecha de Solicitud**: Fecha y hora de creación

### Detalles Según Tipo de Solicitud

#### Para "Nuevo Empleado":
- Nombre Completo
- Cédula/ID Nacional
- Teléfono
- Posición
- Sucursal
- Departamento
- Notas adicionales (si existen)

#### Para "Reemplazo de Equipo":
- Equipo Actual
- Razón del Reemplazo
- Equipo Solicitado
- Notas adicionales

#### Para "Solicitud de Equipo":
- Descripción del Equipo
- Cantidad
- Prioridad
- Justificación

#### Para "Consumibles":
- Tipo de Consumible
- Cantidad
- Descripción
- Notas adicionales

### Pie de Página
- Indicación de que es un correo automatizado
- Instrucciones de no responder directamente
- Copyright del sistema

---

## 🔄 Flujo de Solicitudes

1. **Usuario crea una solicitud** → Estado: `pendiente_rrhh`
   - ✅ Se envía email a `genericosistem@gmail.com` (RRHH)

2. **RRHH revisa la solicitud**:
   - Si aprueba → Estado: `pendiente_admin`
   - Si rechaza → Estado: `rrhh_rechazada`

3. **Admin revisa la solicitud** (solo si está en `pendiente_admin`):
   - Si aprueba → Estado: `aceptada`
   - Si rechaza → Estado: `rechazada`

---

## 🛠️ Archivos Modificados/Creados

### Nuevos Archivos:
- `/src/common/services/email.service.ts` - Servicio de envío de emails

### Archivos Modificados:
- `/src/requests/requests.module.ts` - Agregado EmailService
- `/src/requests/requests.service.ts` - Integración de notificaciones por email

### Archivos de Referencia:
- `.env.example.email` - Ejemplo de variables de entorno

---

## 🧪 Pruebas

### Para probar localmente:

1. **Copia las variables de entorno** al archivo `.env` en el backend
2. **Inicia el servidor**:
   ```bash
   pnpm start:dev
   ```

3. **Crea una solicitud** a través del API o la interfaz:
   ```bash
   POST /requests
   {
     "type": "new_employee",
     "payload": {
       "firstName": "Juan",
       "lastName": "Pérez",
       "nationalId": "1234567890",
       "phone": "8095551234",
       "position": "Desarrollador",
       "branchId": "1",
       "departmentId": "2",
       "notes": "Nuevo desarrollador senior"
     }
   }
   ```

4. **Verifica el email** en la bandeja de entrada de `genericosistem@gmail.com`

---

## ⚠️ Troubleshooting

### El email no se envía

1. **Verifica las credenciales**:
   - `EMAIL_USER` debe ser el email completo: `genericosistem2@gmail.com`
   - `EMAIL_PASSWORD` debe ser la contraseña de aplicación (no la contraseña regular)

2. **Habilita acceso a aplicaciones menos seguras** (si aún no usas contraseña de aplicación):
   - https://myaccount.google.com/lesssecureapps
   - ⚠️ Nota: Google está deprecando esto, es mejor usar contraseña de aplicación

3. **Revisa los logs del servidor**:
   - Error de conexión → Verifica `EMAIL_HOST` y `EMAIL_PORT`
   - Error de autenticación → Verifica credenciales
   - Error de envío → Verifica dirección de email de destino

4. **Verifica el firewall**:
   - Asegúrate que el puerto 587 (o 465) no está bloqueado

### El email se ve extraño

- El template usa HTML5 responsive
- Puede verse diferente según el cliente de email (Gmail, Outlook, etc.)
- Las imágenes y estilos deberían cargarse correctamente

---

## 📝 Próximas Mejoras Posibles

1. Agregar notificación cuando RRHH acepta/rechaza una solicitud
2. Notificación al admin cuando una solicitud está pendiente de aprobación
3. Notificación al solicitante cuando su solicitud es aceptada/rechazada
4. Sistema de templates de email configurable
5. Envío de resumen diario/semanal de solicitudes pendientes

---

## 📞 Soporte

Si tienes problemas con la configuración:

1. Verifica que todas las variables de entorno estén correctamente configuradas
2. Revisa los logs del servidor para mensajes de error específicos
3. Asegúrate que la cuenta de Google tiene habilitada la verificación en dos pasos
4. Intenta generar una nueva contraseña de aplicación

---

**Última actualización**: 26 de Diciembre, 2025
**Estado**: ✅ Implementado y listo para usar
