# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Backend API for "Censos Veredales" - a rural census management system for community organizations in Colombia. Built with Express.js, MongoDB/Mongoose, and JWT authentication.

## Commands

```bash
npm run dev      # Start development server with auto-reload
npm start        # Start production server
npm run seed     # Run database seeder
```

## Architecture

**Pattern**: MVC with middleware-based authentication and Zod validation

```
├── app.js              # Express app, MongoDB connection, Swagger docs
├── routes/             # API endpoints (9 routes)
├── controllers/        # Business logic (9 controllers)
├── models/             # Mongoose schemas (8 models)
├── middlewares/        # auth.js (JWT/roles), validate.js (Zod)
├── schemas/            # Zod validation schemas
├── helpers/            # Utility functions
└── scripts/            # Database seeding
```

## Key Models

- **User**: Authentication + profile (roles: president, tesorero, secretario, residente, censista)
- **Community**: Neighborhood organization with 6-digit unique code, auto-generated
- **Dwelling**: Housing units requiring 3-admin approval (president, treasurer, secretary)
- **Resident**: Links users to dwellings, auto-promotes User.role on approval
- **Letter**: Normal/juramentada certificates with QR codes
- **Role**: Custom permissions per community (embedded permissions object)
- **Announcement**: Community bulletins (draft/published via publishedAt)
- **PasswordReset**: Token-based password recovery (1hr expiry)

## Authentication Flow

- JWT access token (15min) + refresh token (7 days)
- Token passed via `x-token` header
- Middlewares: `auth`, `checkRole`, `isPresident`, `checkPermission`, `checkCommunityAccess`
- Password reset via email with UUID token

## Approval Workflow

Dwellings, Residents, and Letters use a triple-approval system:
- Each requires approval from president, treasurer, and secretary
- Status auto-updates: `pending` → `approved` (all 3) or `rejected` (any rejection)
- Post-save hooks handle automatic status transitions

## Community Scoping

All resources are scoped to community via `req.communityId` extracted from JWT token:
- **Announcements**: Created/filtered by `communityId`, only visible if `publishedAt <= now`
- **Letters**: Linked to `communityId`, QR verification is public endpoint
- **Dwellings/Residents**: Owned by users within their community

## Announcements (Anuncios)

- **Fields**: title, header, body, images[], createdBy, communityId, publishedAt
- **Draft/Published**: `publishedAt = null` → draft; `publishedAt <= now` → visible
- **Permissions**: announcement:create, read, update, delete (via Role permissions)
- **Access**: Only creator or president can edit/delete

## Letters (Cartas)

- **Types**: `normal` (residente aprobado) vs `juramentada` (≥1 año antigüedad)
- **QR Code**: Format `LETTER-XXXXXXXX` (8 random chars), public verification endpoint
- **Status Flow**: pending → approved/issued (requires all 3 admins) → PDF generation
- **Endpoints**:
  - `POST /letters` - Request new letter
  - `GET /letters/my-letters` - User's letters
  - `GET /letters/community` - All community letters (president only)
  - `POST /letters/:id/approve/{president|treasurer|secretary}` - Admin approval
  - `GET /letters/verify/:qrCodigo` - Public QR verification

## API Documentation

Swagger UI available at `http://localhost:3000/api-docs` when running.

## Environment Variables

See `.env.example`. Requires MongoDB, JWT secrets, and SMTP credentials for email functionality.
