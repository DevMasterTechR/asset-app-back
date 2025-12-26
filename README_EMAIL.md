# 📧 Implementación: Sistema de Notificaciones por Email para RRHH

## 🎯 Objetivo Completado

✅ **Cuando se crea una nueva solicitud a RRHH, se envía automáticamente un correo formal a `genericosistem@gmail.com` desde `genericosistem2@gmail.com` con toda la información de la solicitud.**

---

## 📚 Documentación Disponible

### Para Empezar Rápido 🚀
👉 **Lee primero**: [`GUIA_RAPIDA.md`](./GUIA_RAPIDA.md)
- Resumen visual en español
- Pasos de configuración simplificados
- Cómo verificar que funciona
- Troubleshooting básico

### Para Configuración Detallada 🔧
👉 **Lee si necesitas detalles**: [`EMAIL_CONFIG.md`](./EMAIL_CONFIG.md)
- Instrucciones paso a paso completas
- Explicación de seguridad
- Variables de entorno detalladas
- Solución de problemas avanzada
- Próximas mejoras sugeridas

### Para Desarrolladores 👨‍💻
👉 **Lee si vas a modificar el código**: [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md)
- Resumen técnico completo
- Descripción de archivos creados/modificados
- Estructura del flujo de notificaciones
- Checklist de verificación
- Próximos pasos de desarrollo

### Para Referencia SQL 📊
👉 **Ver**: [`example_request.sql`](./example_request.sql)
- Ejemplos de cómo se guardan las solicitudes
- Estados y tipos disponibles
- Consultas SQL útiles

---

## 📁 Archivos del Sistema

### Nuevos Archivos Creados

```
asset-app-back/
├── src/
│   └── common/
│       └── services/
│           └── email.service.ts          ✨ Servicio principal de email
├── GUIA_RAPIDA.md                        📖 Guía para empezar rápido
├── EMAIL_CONFIG.md                       📖 Documentación completa
├── IMPLEMENTATION_SUMMARY.md             📖 Resumen técnico
├── .env.template                         📋 Template de variables de entorno
├── .env.example.email                    📋 Ejemplo específico para email
└── example_request.sql                   📋 Ejemplos SQL
```

### Archivos Modificados

```
asset-app-back/
└── src/
    └── requests/
        ├── requests.service.ts           🔄 Agrega envío de email
        └── requests.module.ts            🔄 Importa EmailService
```

---

## 🔄 Flujo de Funcionamiento

```
1. Usuario crea solicitud
        ↓
2. Sistema guarda en BD
        ↓
3. Sistema genera email formal
        ↓
4. Email se envía a genericosistem@gmail.com
        ↓
5. RRHH recibe notificación con toda la información
        ↓
6. RRHH puede revisar/aprobar/rechazar en el sistema
```

---

## ⚙️ Configuración Mínima Necesaria

Solo necesitas agregar 7 variables de entorno al archivo `.env`:

```env
EMAIL_USER=genericosistem2@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx        # Contraseña de aplicación de Google
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM=genericosistem2@gmail.com
HR_NOTIFICATION_EMAIL=genericosistem@gmail.com
```

---

## ✨ Características Implementadas

- ✅ Envío automático de notificaciones al crear solicitud
- ✅ Email profesional y responsivo
- ✅ Soporte para 4 tipos de solicitudes (Nuevo Empleado, Equipo, Consumibles, Reemplazo)
- ✅ Detalles específicos según tipo de solicitud
- ✅ Manejo robusto de errores
- ✅ Logs para debugging
- ✅ Seguridad con contraseña de aplicación (no contraseña regular)
- ✅ Variables de entorno configurables
- ✅ Template HTML profesional

---

## 📊 Tipos de Solicitudes Soportados

1. **`new_employee`** - Nuevo Empleado
   - Información: Nombre, cédula, teléfono, puesto, sucursal, departamento

2. **`equipment_replacement`** - Reemplazo de Equipo
   - Información: Equipo actual, razón, equipo solicitado

3. **`equipment_request`** - Solicitud de Equipo
   - Información: Descripción, cantidad, prioridad, justificación

4. **`consumables`** - Consumibles
   - Información: Tipo, cantidad, descripción

---

## 🧪 Cómo Probar

### 1. Configurar Variables de Entorno
Copiar `.env.template` a `.env` y llenar `EMAIL_PASSWORD`:

```bash
cp .env.template .env
# Editar .env y agregar la contraseña de aplicación de Gmail
```

### 2. Iniciar el Servidor
```bash
pnpm start:dev
```

### 3. Crear una Solicitud de Prueba
```bash
curl -X POST http://localhost:3000/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "new_employee",
    "payload": {
      "firstName": "Juan",
      "lastName": "Pérez",
      "nationalId": "1234567890",
      "phone": "8095551234",
      "position": "Desarrollador",
      "branchId": "1",
      "departmentId": "2",
      "notes": "Nuevo empleado"
    }
  }'
```

### 4. Revisar Email
Abrir `genericosistem@gmail.com` y verificar que el correo llegó en ~1 minuto.

---

## 🆘 Primeros Pasos si hay Problemas

### El email no se envía
1. Verifica que tienes todas las variables en `.env`
2. Verifica que `EMAIL_PASSWORD` es la **contraseña de aplicación** (16 caracteres)
3. Verifica que Gmail tiene **verificación en dos pasos habilitada**
4. Revisa los logs del servidor buscando "Email"

### Ver más detalles
👉 Consulta [`GUIA_RAPIDA.md`](./GUIA_RAPIDA.md) en la sección "🆘 Solucionar Problemas"

---

## 📞 Contacto para Configuración

Si necesitas ayuda configurando Gmail:

1. Ve a https://myaccount.google.com/
2. Habilita "Verificación en dos pasos"
3. Ve a https://myaccount.google.com/apppasswords
4. Selecciona "Correo" y "Windows"
5. Copia los 16 caracteres generados a tu `.env`

---

## 📝 Próximas Mejoras Sugeridas

- [ ] Enviar email también cuando RRHH aprueba/rechaza
- [ ] Sistema de cola de emails con reintentos (BullMQ)
- [ ] Notificación al solicitante del estado de su solicitud
- [ ] Dashboard con historial de emails enviados
- [ ] Templates de email personalizables por rol
- [ ] Resumen diario/semanal de solicitudes pendientes

---

## 🎓 Resumen Técnico

**Servicio creado**: `EmailService` en `src/common/services/email.service.ts`

**Métodos principales**:
- `sendEmail(options)` - Envío genérico de emails
- `sendNewRequestNotificationToHR(requestData, requesterName, requestCode)` - Notificación de nuevas solicitudes
- `generateNewRequestEmailTemplate()` - Generación de HTML profesional

**Integración**:
- Inyectado en `RequestsModule`
- Utilizado en `RequestsService.create()`
- No afecta la creación de solicitudes si falla el email

---

## 📚 Referencias

- [NestJS Mailer Documentation](https://docs.nestjs.com/recipes/sending-emails)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SMTP Configuration](https://www.nodemailer.com/smtp/)

---

## ✅ Verificación Final

Para verificar que todo esté correctamente implementado:

- [x] Servicio de email creado
- [x] Integración en módulo de solicitudes
- [x] Envío automático al crear solicitud
- [x] Template HTML profesional
- [x] Manejo de errores robusto
- [x] Documentación completa
- [x] Ejemplos de configuración
- [x] Ejemplos de uso
- [x] Guía de troubleshooting

---

## 📅 Información de Implementación

- **Fecha**: 26 de Diciembre, 2025
- **Estado**: ✅ Completado y listo para usar
- **Versión**: 1.0
- **Autor**: Sistema de Gestión de Activos

---

## 🎉 ¡Listo para Usar!

La implementación está completa. Solo necesitas:

1. ✅ Leer [`GUIA_RAPIDA.md`](./GUIA_RAPIDA.md)
2. ✅ Configurar las variables de entorno
3. ✅ Reiniciar el servidor
4. ✅ ¡Crear una solicitud y recibir el email!

**¡Que funcione todo correctamente!** 🚀
