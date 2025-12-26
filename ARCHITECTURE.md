# 🏗️ Estructura del Sistema de Notificaciones

## 📂 Árbol de Archivos

```
asset-app-back/
│
├── 📖 DOCUMENTACIÓN
│   ├── README_EMAIL.md                ← 👈 EMPEZAR AQUÍ
│   ├── GUIA_RAPIDA.md                 ← Guía para configurar rápido
│   ├── EMAIL_CONFIG.md                ← Documentación completa
│   ├── IMPLEMENTATION_SUMMARY.md      ← Resumen técnico
│   ├── CHECKLIST.md                   ← Checklist de verificación
│   └── ARCHITECTURE.md                ← Este archivo
│
├── 📋 CONFIGURACIÓN
│   ├── .env                           ← Variables de entorno (NO INCLUIR EN GIT)
│   ├── .env.template                  ← Template de variables
│   └── .env.example.email             ← Ejemplo específico para email
│
├── 📊 EJEMPLOS
│   └── example_request.sql            ← Ejemplos de solicitudes en SQL
│
├── 📦 CÓDIGO FUENTE
│   └── src/
│       ├── common/
│       │   └── services/
│       │       └── email.service.ts   ✨ NUEVO - Servicio de email
│       │
│       └── requests/
│           ├── requests.module.ts     🔄 MODIFICADO - Importa EmailService
│           ├── requests.service.ts    🔄 MODIFICADO - Envía notificaciones
│           └── requests.controller.ts (sin cambios)
│
└── prisma/
    ├── schema.prisma
    └── migrations/
```

---

## 🔄 Flujo de Datos

```
┌──────────────────┐
│ Usuario Frontend │
└────────┬─────────┘
         │
         │ POST /requests
         │
         ▼
┌──────────────────────────┐
│ RequestsController       │
│ - create()               │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ RequestsService                          │
│ - create()                               │
│   ├─ Genera código único                │
│   ├─ Guarda en BD (Prisma)              │
│   └─ 🎯 Llamar EmailService            │
└────────┬─────────────────────────────────┘
         │
         ├─────────────────────┐
         │                     │
         ▼                     ▼
    ┌────────────┐      ┌──────────────────────┐
    │  Prisma    │      │  EmailService        │
    │  Request   │      │  - sendEmail()       │
    │  Guardado  │      │  - sendNewRequest... │
    └────────────┘      │                      │
                        │  ✉️ Conecta con SMTP│
                        └──────────┬───────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │ Gmail SMTP Server    │
                        │ smtp.gmail.com:587   │
                        └──────────┬───────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │ Email Enviado a      │
                        │ genericosistem@...   │
                        │ .gmail.com (RRHH)    │
                        └──────────────────────┘
```

---

## 🎯 Componentes Principales

### 1. **EmailService** (`src/common/services/email.service.ts`)

```typescript
class EmailService {
  // Configuración SMTP
  transporter: nodemailer.Transporter
  
  // Métodos
  async sendEmail(options)                    // Envío genérico
  async sendNewRequestNotificationToHR()      // Notificación de solicitud
  
  // Generadores de template
  generateNewRequestEmailTemplate()           // HTML profesional
  generateNewEmployeeDetails()                // Detalles para nuevo empleado
  generateEquipmentRequestDetails()           // Detalles para equipo
  generateConsumablesDetails()                // Detalles para consumibles
  generateEquipmentReplacementDetails()       // Detalles para reemplazo
}
```

### 2. **RequestsService Modificado** (`src/requests/requests.service.ts`)

```typescript
class RequestsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService  // ← NUEVO
  ) {}
  
  async create() {
    // ... crear solicitud ...
    const request = await this.prisma.request.create({...})
    
    // ← NUEVO: Enviar notificación
    try {
      await this.emailService.sendNewRequestNotificationToHR(...)
    } catch (error) {
      console.error('Error al enviar email')
      // No lanzar excepción - no afecta la solicitud
    }
    
    return request
  }
}
```

### 3. **RequestsModule Actualizado** (`src/requests/requests.module.ts`)

```typescript
@Module({
  controllers: [RequestsController],
  providers: [
    RequestsService,
    PrismaService,
    EmailService  // ← NUEVO
  ],
  exports: [RequestsService],
})
```

---

## 📧 Estructura del Email Enviado

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔔 Nueva Solicitud de Recursos Humanos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────┐
│ ⚠️ ACCIÓN REQUERIDA                         │
│ Una nueva solicitud requiere su revisión    │
└─────────────────────────────────────────────┘

Información General:
├─ Código de Solicitud:    SOL-20251226-0001
├─ Solicitante:            Juan Pérez
├─ Tipo de Solicitud:      Nuevo Empleado
└─ Fecha de Solicitud:     26 de diciembre de 2025

Detalles de la Solicitud:
├─ Nombre Completo:        Juan Pérez García
├─ Cédula/ID:              1234567890
├─ Teléfono:               809-555-1234
├─ Posición:               Ingeniero Senior
├─ Sucursal:               Sucursal Principal
├─ Departamento:           Desarrollo
└─ Notas:                  Nuevo empleado...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
© 2025 Sistema de Gestión de Activos
```

---

## ⚙️ Variables de Entorno Requeridas

```env
EMAIL_USER              = genericosistem2@gmail.com
EMAIL_PASSWORD          = xxxx xxxx xxxx xxxx
EMAIL_HOST              = smtp.gmail.com
EMAIL_PORT              = 587
EMAIL_SECURE            = false
EMAIL_FROM              = genericosistem2@gmail.com
HR_NOTIFICATION_EMAIL   = genericosistem@gmail.com
```

---

## 🔄 Ciclo de Vida de una Solicitud

```
Paso 1: Usuario crea solicitud
  └─ POST /requests
     └─ payload: { type, payload }

Paso 2: Sistema procesa solicitud
  └─ RequestsController.create()
     └─ RequestsService.create()
        ├─ Genera código único
        ├─ Guarda en Prisma
        └─ Llamar EmailService

Paso 3: Envío de notificación
  └─ EmailService.sendNewRequestNotificationToHR()
     ├─ Obtiene datos de la solicitud
     ├─ Genera template HTML
     └─ Envía a través de SMTP

Paso 4: Email llega a RRHH
  └─ genericosistem@gmail.com recibe email
     └─ RRHH puede revisar, aprobar o rechazar
```

---

## 🧪 Métodos Principales

### EmailService.sendEmail()

```typescript
async sendEmail(options: {
  to: string              // Email destino
  subject: string         // Asunto
  html: string           // Contenido HTML
  from?: string          // Email remitente (opcional)
}): Promise<void>
```

### EmailService.sendNewRequestNotificationToHR()

```typescript
async sendNewRequestNotificationToHR(
  requestData: any,       // Datos de la solicitud
  requesterName: string,  // Nombre del solicitante
  requestCode: string     // Código único
): Promise<void>
```

---

## 📊 Tipos de Datos

### Estructura de una Solicitud Guardada

```json
{
  "id": 1,
  "code": "SOL-20251226-0001",
  "personId": 5,
  "type": "new_employee",
  "status": "pendiente_rrhh",
  "payload": {
    "firstName": "Juan",
    "lastName": "Pérez",
    "nationalId": "1234567890",
    "phone": "8095551234",
    "position": "Ingeniero Senior",
    "branchId": "1",
    "departmentId": "2",
    "notes": "Nuevo empleado para equipo de desarrollo"
  },
  "hrReviewerId": null,
  "adminReviewerId": null,
  "hrReason": null,
  "adminReason": null,
  "hrSeenAt": null,
  "createdAt": "2025-12-26T12:00:00Z",
  "updatedAt": "2025-12-26T12:00:00Z",
  "person": {
    "firstName": "Carlos",
    "lastName": "García"
  }
}
```

---

## 🛡️ Manejo de Errores

```
┌─ Falla en envío de email
│  └─ Se captura en try/catch
│     └─ Se registra en logs
│        └─ NO se lanza excepción
│           └─ La solicitud se crea igual
│              └─ Usuario recibe respuesta exitosa
│                 └─ Admin puede revisar logs para reenviar
```

**Razón**: El correo es una notificación auxiliar, no debe afectar la solicitud principal.

---

## 🚀 Cómo se Integra Todo

1. **Frontend** envía solicitud
   ↓
2. **Controller** recibe y valida
   ↓
3. **Service** procesa y guarda
   ↓
4. **EmailService** prepara y envía
   ↓
5. **Gmail SMTP** envía el correo
   ↓
6. **RRHH** recibe notificación

---

## 📈 Escalabilidad Futura

### Opción 1: Usar BullMQ (Recomendado)

```
RequestsService → EnqueueJob(email) → Queue → EmailWorker → SMTP
                                      ↑
                                      Reintentos automáticos
                                      Persistencia
```

### Opción 2: Sistema de Plantillas

```
EmailService
├─ getTemplate('new_request')
├─ getTemplate('approved')
├─ getTemplate('rejected')
└─ personalizar según rol/usuario
```

---

## 📚 Referencias de Código

### Instancia de EmailService

```typescript
// En requests.module.ts
providers: [RequestsService, PrismaService, EmailService]

// En requests.service.ts
constructor(
  private prisma: PrismaService,
  private emailService: EmailService,  // Inyectado automáticamente
) {}
```

### Uso en RequestsService

```typescript
await this.emailService.sendNewRequestNotificationToHR(
  { type: request.type, payload: request.payload },
  requesterFullName,
  request.code,
);
```

---

## 🔐 Seguridad

### Credenciales
- ✅ No hardcodeadas en el código
- ✅ En variables de entorno
- ✅ Usar contraseña de aplicación (no contraseña regular)

### Datos
- ✅ Solo se envían datos necesarios
- ✅ No se incluyen contraseñas o tokens
- ✅ Información pública de solicitud

### Transporte
- ✅ SMTP con TLS (puerto 587)
- ✅ Conexión encriptada con Gmail
- ✅ Validación de certificados SSL

---

## 📞 Diagrama de Dependencias

```
app.module.ts
    ↓
requests.module.ts
    ├─ requests.controller.ts
    ├─ requests.service.ts ─→ EmailService ─→ Nodemailer
    └─ prisma.service.ts ─→ Base de datos

EmailService
    ├─ nodemailer (transporte SMTP)
    └─ templates (generadores HTML)
```

---

**Documento**: Arquitectura del Sistema de Notificaciones  
**Fecha**: 26 de Diciembre, 2025  
**Estado**: ✅ Documentado
