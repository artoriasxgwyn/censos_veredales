# Sistema de Notificaciones y Auditoría - Implementación Completa

## Fecha: 2026-05-02

---

## 1. Sistema de Notificaciones

### Archivos Creados/Modificados

#### Nuevos Archivos
- `api_censos/models/notification.model.js` - Modelo de notificaciones
- `api_censos/controllers/notification.controller.js` - Controller con 6 funciones
- `api_censos/routes/notification.routes.js` - Rutas de notificaciones

#### Archivos Modificados (integración de notificaciones)
- `api_censos/app.js` - Registro de rutas `/api/notifications`
- `api_censos/controllers/resident.controller.js` - Notificar creación y aprobación de residentes
- `api_censos/controllers/dwelling.controller.js` - Notificar creación y aprobación de viviendas
- `api_censos/controllers/letter.controller.js` - Notificar creación y aprobación de cartas
- `api_censos/controllers/user.controller.js` - Notificar cambios de contraseña
- `api_censos/controllers/pendingProfileChange.controller.js` - Notificar cambios de perfil
- `api_censos/controllers/pendingDwellingChange.controller.js` - Notificar modificaciones de vivienda
- `api_censos/controllers/approval.controller.js` - Notificar aprobaciones/rechazos

### Modelo de Notificación

```javascript
{
  userId: ObjectId (ref: User),
  communityId: ObjectId (ref: Community),
  type: 'profile_change' | 'password_change' | 'dwelling_change' | 
        'resident_approval' | 'dwelling_approval' | 'letter_approval' | 'general',
  title: String,
  message: String,
  entity: 'user' | 'resident' | 'dwelling' | 'letter' | 'profile' | 'password',
  entityId: ObjectId,
  read: Boolean (default: false),
  actionUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Endpoints Disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/notifications` | Obtener mis notificaciones (últimas 50) |
| GET | `/api/notifications/unread-count` | Cantidad de notificaciones no leídas |
| POST | `/api/notifications/:id/read` | Marcar notificación como leída |
| POST | `/api/notifications/read-all` | Marcar todas como leídas |

### Flujo de Notificaciones

#### Cuando se crea un residente (no por presidente)
```
notifyAllAdmins() → president, secretario, tesorero
- type: 'resident_approval'
- title: 'Nuevo residente pendiente de aprobación'
- message: 'Se ha registrado un nuevo residente. Requiere tu aprobación.'
```

#### Cuando se crea una vivienda (no por presidente)
```
notifyAllAdmins() → president, secretario, tesorero
- type: 'dwelling_approval'
- title: 'Nueva vivienda pendiente de aprobación'
- message: 'Se ha registrado una nueva vivienda. Requiere tu aprobación.'
```

#### Cuando se crea una carta (no por presidente)
```
notifyAllAdmins() → president, secretario, tesorero
- type: 'letter_approval'
- title: 'Nueva carta {type} pendiente de aprobación'
- message: 'Se ha solicitado una carta {type}. Requiere tu aprobación.'
```

#### Cuando se aprueba/rechaza un residente
```
createNotification() → createdBy del residente
- type: 'resident_approval'
- title: 'Residente aprobado' | 'Residente rechazado'
- message: 'Un administrador {aprobó/rechazó} al residente registrado'
```

#### Cuando se aprueba/rechaza una vivienda
```
createNotification() → createdBy de la vivienda
- type: 'dwelling_approval'
- title: 'Vivienda aprobada' | 'Vivienda rechazada'
- message: 'Un administrador {aprobó/rechazó} la vivienda solicitada'
```

#### Cuando se aprueba/rechaza una carta
```
createNotification() → userId solicitante
- type: 'letter_approval'
- title: 'Carta aprobada' | 'Carta rechazada'
- message: 'Un administrador {aprobó/rechazó} tu solicitud de carta {type}'
```

#### Cuando se solicita cambio de perfil
```
createNotification() → presidente
- type: 'profile_change'
- title: 'Solicitud de cambio de perfil'
- message: 'El residente {nombre} ha solicitado un cambio de perfil'
```

#### Cuando se decide cambio de perfil
```
createNotification() → residente solicitante
- type: 'profile_change'
- title: 'Cambio de perfil aprobado' | 'Cambio de perfil rechazado'
- message: 'Tu solicitud ha sido {aprobada/rechazada}'
```

#### Cuando se solicita cambio de contraseña
```
createNotification() → presidente
- type: 'password_change'
- title: 'Solicitud de cambio de contraseña'
- message: '{nombre} ha solicitado un cambio de contraseña'
```

#### Cuando se decide cambio de contraseña
```
createNotification() → usuario solicitante
- type: 'password_change'
- title: 'Contraseña cambiada' | 'Cambio de contraseña rechazado'
- message: 'El presidente ha {aprobado/rechazado} tu solicitud'
```

#### Cuando se solicita modificación de vivienda
```
notifyAllAdmins() → president, secretario, tesorero
- type: 'dwelling_change'
- title: 'Solicitud de modificación de vivienda'
- message: 'Se ha solicitado una modificación para la vivienda {nomenclatura}'
```

#### Cuando se decide modificación de vivienda
```
createNotification() → ownerUserId de la vivienda
- type: 'dwelling_change'
- title: 'Modificación aprobada' | 'Modificación rechazada'
- message: 'La modificación ha sido {aprobada/rechazada} por {rol}'
```

---

## 2. Sistema de Logs de Auditoría

### Archivos Existentes
- `api_censos/models/auditLog.model.js` - Modelo de logs
- `api_censos/middlewares/audit.js` - Middleware `auditLog(entity, action)`

### Modelo de Auditoría

```javascript
{
  userId: ObjectId (ref: User),
  action: String (create, update, delete, approve, reject, assignRole, removeRole, etc.),
  entity: String (resident, dwelling, letter, user, community, profileChange, dwellingChange),
  entityId: ObjectId,
  oldValues: Object,
  newValues: Object,
  ipAddress: String,
  userAgent: String,
  communityId: ObjectId (ref: Community),
  timestamp: Date
}
```

### Rutas con Audit Logging

#### Residentes (`routes/resident.routes.js`)
```javascript
POST   /                              → auditLog('resident', 'create')
PUT    /:id                           → auditLog('resident', 'update')
DELETE /:id                           → auditLog('resident', 'delete')
POST   /:id/approve/president         → auditLog('resident', 'approve')
POST   /:id/approve/treasurer         → auditLog('resident', 'approve')
POST   /:id/approve/secretary         → auditLog('resident', 'approve')
```

#### Viviendas (`routes/dwelling.routes.js`)
```javascript
POST   /                              → auditLog('dwelling', 'create')
PUT    /:id                           → auditLog('dwelling', 'update')
DELETE /:id                           → auditLog('dwelling', 'delete')
POST   /:id/approve/president         → auditLog('dwelling', 'approve')
POST   /:id/approve/treasurer         → auditLog('dwelling', 'approve')
POST   /:id/approve/secretary         → auditLog('dwelling', 'approve')
```

#### Cartas (`routes/letter.routes.js`)
```javascript
POST   /                              → auditLog('letter', 'create')
POST   /:id/approve/president         → auditLog('letter', 'approve')
POST   /:id/approve/treasurer         → auditLog('letter', 'approve')
POST   /:id/approve/secretary         → auditLog('letter', 'approve')
```

#### Usuarios (`routes/users.routes.js`)
```javascript
POST   /                              → auditLog('user', 'create')
PUT    /:id                           → auditLog('user', 'update')
DELETE /:id                           → auditLog('user', 'delete')
POST   /:id/role                      → auditLog('user', 'assignRole')
DELETE /:id/role                      → auditLog('user', 'removeRole')
PUT    /:id/password                  → (sin audit - usa pendingPassword)
POST   /approve-password-change       → auditLog('user', 'approvePasswordChange')
```

#### Comunidades (`routes/community.routes.js`)
```javascript
PUT    /:id                           → auditLog('community', 'update')
DELETE /:id                           → auditLog('community', 'delete')
```

#### Cambios de Perfil (`routes/pendingProfileChange.routes.js`)
```javascript
POST   /:id/approve                   → auditLog('profileChange', 'approve')
```

#### Cambios de Vivienda (`routes/pendingDwellingChange.routes.js`)
```javascript
POST   /:id/approve                   → auditLog('dwellingChange', 'approve')
```

#### Aprobaciones (`routes/approval.routes.js`)
```javascript
POST   /resident/:id                  → auditLog('resident', 'approve')
POST   /dwelling/:id                  → auditLog('dwelling', 'approve')
POST   /letter/:id                    → auditLog('letter', 'approve')
```

---

## 3. Resumen de Cambios por Archivo

### Controllers
| Archivo | Cambios |
|---------|---------|
| `notification.controller.js` | Creado con 6 funciones exportables |
| `resident.controller.js` | +notifyAllAdmins en createResident, +createNotification en approve* |
| `dwelling.controller.js` | +notifyAllAdmins en createDwelling, +createNotification en approve* |
| `letter.controller.js` | +notifyAllAdmins en requestLetter, +createNotification en approve* |
| `user.controller.js` | +createNotification en changePassword y approvePasswordChange |
| `pendingProfileChange.controller.js` | +createNotification en request y approve |
| `pendingDwellingChange.controller.js` | +notifyAllAdmins en request, +createNotification en approve |
| `approval.controller.js` | +createNotification en approveResident, approveDwelling, approveLetter |

### Routes
| Archivo | Cambios |
|---------|---------|
| `notification.routes.js` | Creado con 4 endpoints |
| `resident.routes.js` | +auditLog en 6 rutas |
| `dwelling.routes.js` | +auditLog en 6 rutas |
| `letter.routes.js` | +auditLog en 4 rutas |
| `users.routes.js` | +auditLog en 5 rutas |
| `community.routes.js` | +auditLog en 2 rutas |
| `pendingProfileChange.routes.js` | +auditLog en 1 ruta |
| `pendingDwellingChange.routes.js` | +auditLog en 1 ruta |
| `approval.routes.js` | +auditLog en 3 rutas |

### App
| Archivo | Cambios |
|---------|---------|
| `app.js` | +import notificationRoutes, +app.use('/api/notifications') |

---

## 4. Próximos Pasos / Pendientes

- [ ] Crear endpoint para obtener logs de auditoría (solo presidente)
- [ ] Agregar filtros por fecha, entidad, usuario en logs
- [ ] Implementar export de logs a CSV
- [ ] Frontend: Componente de bandeja de notificaciones en Vue
- [ ] Frontend: Badge de notificaciones no leídas en navbar
- [ ] Frontend: Vista de logs de auditoría para presidente

---

## 5. Comandos Útiles

```bash
# Ver logs de auditoría en MongoDB
db.auditlogs.find().sort({ timestamp: -1 }).limit(10)

# Ver notificaciones de un usuario
db.notifications.find({ userId: ObjectId("...") }).sort({ createdAt: -1 })

# Contar notificaciones no leídas
db.notifications.countDocuments({ userId: ObjectId("..."), read: false })
```
