# Censos Veredales - Project Context

## Project Overview
Sistema de gestión para comunidades veredales. Incluye autenticación, registro de residentes, viviendas, cartas, anuncios y firmas digitales.

## Tech Stack
- **Backend**: Node.js + Express + Mongoose
- **Frontend**: Vue 3 + Vite + Quasar + Pinia
- **Database**: MongoDB
- **Image Storage**: Cloudinary

## Key Architecture Decisions

### Dwelling Ownership (Cédula-based)
- `ownerUserId` (ObjectId, nullable) - vincula usuario registrado
- `cedulaPropietario` (String) - cédula del dueño (registrado o no)
- Al crear vivienda: busca usuario por cédula en la comunidad; si existe, llena `ownerUserId`
- Queries usan `$or`: `{ ownerUserId: userId }` O `{ cedulaPropietario: user.documentNumber }`

### Image Upload Flow
- Frontend → Backend → Cloudinary
- Middleware: `multer` + `cloudinary` SDK
- Endpoint: `POST /api/upload` (FormData con `file` + `type`)
- Tipos: `facade` (viviendas), `signature` (firmas)
- Servicio frontend: `uploadService.uploadImage(file, type)`

### Digital Signature
- Componente `SignaturePad.vue` usa signature_pad library
- Firma se convierte a PNG (dataURL) y se sube antes del registro
- URL se guarda en `User.digitalSignature`

## File Structure
```
censos_veredales/
├── api_censos/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── dwelling.controller.js (cedula-based ownership)
│   │   ├── upload.controller.js
│   │   └── ...
│   ├── middlewares/
│   │   ├── upload.js (multer + cloudinary)
│   │   └── auth.js
│   ├── models/
│   │   ├── dwelling.model.js (cedulaPropietario + ownerUserId)
│   │   └── ...
│   ├── schemas/
│   └── routes/
├── frontend_censos/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SignaturePad.vue
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── upload.service.js
│   │   │   └── ...
│   │   ├── stores/
│   │   └── views/
│   │       ├── auth/PublicRegisterView.vue
│   │       └── dwellings/DwellingCreateView.vue
```

## Key Patterns

### Dwelling Ownership Query Pattern
```javascript
const currentUser = await User.findById(req.userId).select('documentNumber');
const dwellings = await Dwelling.find({
  communityId: req.communityId,
  isActive: true,
  $or: [
    { ownerUserId: req.userId },
    { cedulaPropietario: currentUser.documentNumber }
  ]
});
```

### Dwelling Creation with Cédula Lookup
```javascript
const propietario = await User.findOne({
  documentNumber: cedulaPropietario,
  communityId: req.communityId,
  isActive: true
});
const ownerUserId = propietario?._id || null;
```

## Environment Variables
```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```
