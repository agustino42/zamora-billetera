# Zamora Wallet

**Billetera estudiantil + programa de incentivos on-chain para campus universitario.**

Gana el token **ZAM** (Zamora Token, ERC-20) por tus notas, asistencia, tareas y
participación en el foro. Aprende, comparte, redime recompensas y obtén
certificados verifiable on-chain. Construido con Next.js 15, thirdweb, Base
Sepolia y Supabase.

---

## Tabla de contenidos

- [Características](#características)
- [Stack](#stack)
- [Arquitectura](#arquitectura)
- [Economía del token](#economía-del-token)
- [Puesta en marcha](#puesta-en-marcha)
- [Contratos inteligentes](#contratos-inteligentes)
- [Base de datos (Supabase)](#base-de-datos-supabase)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Scripts disponibles](#scripts-disponibles)

---

## Características

### Estudiante
- **Billetera**: saldo ZAM, historial, recibir (QR) y transferir.
- **Tareas**: entregar pruebas (hash) y reclamar recompensas.
- **Asistencia**: check-in con código temporal de la clase.
- **Cursos**: catálogo, inscripción con split 80/20 y certificados SBT.
- **Foro**: publicar con peaje reembolsable, votar, tips y boost.
- **Recompensas**: canjear ZAM por beneficios del campus.
- **Logros**: niveles, badges, ranking y coleccionables.
- **Perfil**: identidad, materias, créditos y código de referido.

### Profesor
- Resumen de cátedra, materias, tareas, exámenes, notas, asistencia,
  alumnos, recompensas y cursos con ingresos.

### Administrador
- Usuarios, creación de **profesores con credenciales**, materias, tareas,
  asistencia, notas, **economía ZAMORA** (acuñar/quemar + gráficas),
  recompensas, certificados, moderación de foro y configuración.

### Transversal
- **Login mixto**: estudiantes con thirdweb In-App Wallet (email/Google,
  gasless), profesores/admin con credenciales Supabase.
- **Modo demo**: toda la app funciona sin configurar Supabase ni contratos
  (datos mock + login por selección de rol).
- **Responsive mobile-first**: bottom tab bar en móvil, sidebar en desktop.
- Tema claro/oscuro (por defecto oscuro) y animaciones con Framer Motion.

---

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Estilos | Tailwind CSS, Radix UI, lucide-react, Framer Motion |
| Web3 | thirdweb v5, viem, Base Sepolia (chainId 84532) |
| Contratos | Solidity 0.8.24, Hardhat, OpenZeppelin 5 |
| Datos / Auth | Supabase (PostgreSQL + RLS + Auth) |
| Gráficas | Recharts |

---

## Arquitectura

```
┌──────────────────────────────────────────────────────────────┐
│                     Next.js 15 (App Router)                  │
│  Landing · Login · /app (estudiante) · /professor · /admin   │
└───────────────┬───────────────────────────────┬──────────────┘
                │                               │
      thirdweb / viem                    Supabase (RLS)
                │                               │
                ▼                               ▼
   ┌────────────────────────┐      ┌────────────────────────┐
   │  Base Sepolia (on-chain)│      │  Postgres (off-chain)  │
   │  ZamoraToken (ERC-20)   │      │  profiles, grades,     │
   │  ZamoraCampus           │      │  submissions, forum,   │
   │  ZamoraRewards          │      │  awards...             │
   │  ZamoraCollectibles     │      └────────────────────────┘
   │  ZamoraCourses          │
   │  ZamoraForum            │      Principio: solo el HASH va
   └────────────────────────┘      on-chain; los datos viven en
                                   Supabase protegidos por RLS.
```

Una **system wallet** (server-side, vía `SYSTEM_WALLET_PRIVATE_KEY`) posee los
roles `ADMIN`, `MINTER` y `BURNER` y firma las operaciones privilegiadas.

---

## Economía del token

**Gana ZAM:**
| Fuente | Cantidad |
| --- | --- |
| Crédito aprobado | `100` × crédito |
| Tarea aprobada | recompensa fija de la tarea |
| Asistencia | `10` |
| Publicar en el foro | `2` – `10` |

**Gasta ZAM:**
| Acción | Flujo |
| --- | --- |
| Comprar un curso | `80%` instructor · `20%` quemado |
| Pase de conferencia | canje (NFT transferible) |
| Peaje del foro | `5` ZAM **reembolsable** al alcanzar 5 upvotes |
| Tips / tutorías | transferencia entre wallets |
| Boost | quema deflacionaria |
| Gobernanza | voto ponderado |

**Coleccionables:**
- **Certificados de curso** y **badges** → SBT (soulbound, **no transferibles**).
- **Pases de conferencia** → NFT transferibles.

---

## Puesta en marcha

### 1. Requisitos
- Node.js 20+ (probado con 24)
- npm
- Una cuenta en [thirdweb](https://thirdweb.com/dashboard) y [Supabase](https://supabase.com)

### 2. Instalar dependencias
```bash
npm install
```

### 3. Variables de entorno
Copia la plantilla y complétala:
```bash
copy .env.example .env.local     # Windows
# cp .env.example .env.local     # macOS / Linux
```

Modo demo: si dejas los valores de Supabase/contratos vacíos, la app funciona
con datos de ejemplo y login por selección de rol.

### 4. Ejecutar
```bash
npm run dev
```
Abre http://localhost:3000

### 5. (Opcional) Desplegar contratos
```bash
cd contracts
npm install
npm run deploy:sepolia
```
El script imprime y escribe las direcciones; cópialas a `.env.local`
(`NEXT_PUBLIC_ZAMORA_*_ADDRESS`).

### 6. (Opcional) Configurar Supabase
Ejecuta `supabase/schema.sql` en el SQL Editor de tu proyecto Supabase.

---

## Contratos inteligentes

Ubicados en `contracts/src/` (Solidity 0.8.24, EVM `cancun`, `viaIR`).

| Contrato | Responsabilidad |
| --- | --- |
| `ZamoraToken.sol` | ERC-20 + AccessControl. `mint`/`burn`/`burnFrom` con `MINTER_ROLE` y `BURNER_ROLE`. |
| `ZamoraCampus.sol` | Roles, materias, inscripciones, tareas, asistencia (código hash), notas-hash y `award`. |
| `ZamoraRewards.sol` | Catálogo de recompensas y `redeem` que quema ZAM. |
| `ZamoraCollectibles.sol` | ERC-721: Pass transferible; Badge y Certificate como SBT. |
| `ZamoraCourses.sol` | Split 80/20 en `enroll`; `completeCourse` acuña el certificado. |
| `ZamoraForum.sol` | `createPost` con peaje en escrow, upvote con refund a 5 votos, downvote y quema al remover. |

Compilar:
```bash
cd contracts
npm run compile
```

---

## Base de datos (Supabase)

El esquema completo con **Row Level Security** está en
[`supabase/schema.sql`](supabase/schema.sql). Incluye tablas para perfiles,
materias, inscripciones, tareas, entregas, asistencia, notas, cursos,
certificados, coleccionables, recompensas, canjes, foro, votos y el ledger de
premios, además de:

- Funciones de rol (`is_admin()`, `is_professor()`).
- Trigger `handle_new_user` que crea el perfil al registrarse.
- Trigger `sync_forum_votes` que recalcula votos y `refundable`.
- Políticas RLS por rol (estudiante / profesor / admin).

---

## Estructura del proyecto

```
thirdWeb3/
├── contracts/                  # Hardhat + Solidity
│   ├── src/                    # 6 contratos
│   ├── scripts/deploy.ts       # Deploy + roles + salida .env
│   └── hardhat.config.ts
├── supabase/
│   └── schema.sql              # Esquema + RLS
├── src/
│   ├── app/
│   │   ├── page.tsx            # Landing
│   │   ├── login/              # Login mixto
│   │   ├── app/                # Panel estudiante
│   │   ├── professor/          # Panel profesor
│   │   └── admin/              # Panel admin
│   ├── components/
│   │   ├── landing/            # Secciones de la landing
│   │   ├── ui/                 # Primitivas (button, card, ...)
│   │   ├── dashboard/          # DataTable, charts, ui
│   │   ├── student/            # Componentes del estudiante
│   │   ├── app-shell.tsx       # Shell (sidebar + bottom nav)
│   │   ├── role-guard.tsx      # Guard por rol
│   │   ├── providers.tsx       # Theme + thirdweb + session
│   │   └── session-provider.tsx
│   └── lib/
│       ├── config.ts           # Navegación, contratos, economía
│       ├── contracts.ts        # ABIs + getZamoraContract()
│       ├── thirdweb/           # Cliente thirdweb
│       ├── supabase/           # Clientes (browser/server/admin)
│       ├── mock-data.ts        # Datos demo
│       ├── types.ts            # Tipos compartidos
│       └── utils.ts            # Helpers (formato, niveles, hash)
├── .env.example
├── next.config.ts              # Alias webpack "@x402": false
└── tailwind.config.ts          # Tema brand / ink / gold
```

---

## Scripts disponibles

App (raíz):
```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run start      # Servidor de producción
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

Contratos (`contracts/`):
```bash
npm run compile         # Compilar contratos
npm run test            # Tests de Hardhat
npm run deploy:sepolia  # Desplegar en Base Sepolia
```

---

## Paleta

| Token | Color |
| --- | --- |
| `brand` | `#FF6A00` (naranja) |
| `ink` | `#0B0B0B` (negro) |
| `gold` | `#F5B700` (dorado) |
| Fondo | blanco / negro según tema |
