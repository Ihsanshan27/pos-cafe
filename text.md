Berikut adalah revisi *mega-prompt* yang sudah disesuaikan untuk struktur **Multi-Repo / Beda Folder**.

Prompt ini dirancang sangat terstruktur agar AI *coding assistant* Anda (seperti Cursor atau Windsurf) paham bahwa ada dua proyek terpisah yang harus dibuat dalam folder yang berbeda, lengkap dengan skema Prisma yang sudah kita matangkan sebelumnya.

---

### 📋 Prompt Vibe Coding (Versi Multi-Folder / Multi-Repo)

```text
Act as an expert Full-Stack Engineer and Software Architect. I want to build a lightweight F&B Point of Sale (POS), Recipe Management, and Menu system using a multi-folder (multi-repo style) architecture. 

Please generate the foundational code and structure. We will split this project into two main directories: `/backend` (NestJS) and `/frontend` (Vite + React).

### 1. Project Structure & Tech Stack

📂 /backend (NestJS API)
- Framework: NestJS (TypeScript)
- Database & ORM: PostgreSQL with Prisma
- Validation: class-validator, class-transformer

📂 /frontend (Vite React Client)
- Framework: Vite + React (TypeScript)
- Styling: Tailwind CSS + shadcn/ui
- State & Data Fetching: TanStack React Query + Axios

---

### 2. Database Schema (Prisma)
Inside `/backend`, use this optimized schema for `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Ingredient {
  id            String       @id @default(uuid())
  name          String
  unit          String       // e.g., gram, ml, pcs
  costPerUnit   Decimal      // Cost per unit for dynamic HPP calculation
  stockQuantity Float
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  recipes       RecipeItem[]
}

model Menu {
  id            String       @id @default(uuid())
  name          String
  description   String?
  sellingPrice  Decimal
  imageUrl      String?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  ingredients   RecipeItem[]
  transactions  TransactionItem[]
}

model RecipeItem {
  id            String     @id @default(uuid())
  quantity      Float      // Amount needed for 1 portion
  menuId        String
  menu          Menu       @relation(fields: [menuId], references: [id], onDelete: Cascade)
  ingredientId  String
  ingredient    Ingredient @relation(fields: [ingredientId], references: [id], onDelete: Restrict)

  @@unique([menuId, ingredientId])
}

model Transaction {
  id            String            @id @default(uuid())
  totalAmount   Decimal
  status        TransactionStatus @default(COMPLETED)
  createdAt     DateTime          @default(now())
  items         TransactionItem[]
}

model TransactionItem {
  id            String      @id @default(uuid())
  quantity      Int
  priceAtSale   Decimal
  subtotal      Decimal
  transactionId String
  transaction   Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  menuId        String
  menu          Menu        @relation(fields: [menuId], references: [id], onDelete: Restrict)
}

enum TransactionStatus {
  PENDING
  COMPLETED
  CANCELLED
}

```

---

### 3. Core Features & Business Logic

* **Ingredient Management:** Full CRUD for raw materials.
* **Recipe & Menu Management:** Calculate Menu HPP dynamically by fetching its `RecipeItem`s and summing (`RecipeItem.quantity * Ingredient.costPerUnit`).
* **Order & Stock Sync:** When a transaction is completed, automatically deduct the `stockQuantity` of the corresponding `Ingredient`s based on the recipe formulas.

---

### 4. Step-by-Step Execution Plan

Please execute the implementation sequentially. Ask for my confirmation after completing each step:

**Step 1: Backend Scaffolding & Prisma Setup**

* Initialize the `/backend` folder structures.
* Setup `PrismaService` and `PrismaModule`.
* Configure global validation pipes and Enable CORS so the frontend can communicate with it.

**Step 2: Backend Modules (Ingredients & Menus)**

* Generate `IngredientsModule` (Controller, Service, DTOs with validation).
* Generate `MenusModule` containing the endpoint to fetch menus along with their dynamically calculated HPP.

**Step 3: Backend Modules (Transactions)**

* Generate `TransactionsModule` with stock auto-deduction logic inside a Prisma Transaction (to ensure ACID compliance).

**Step 4: Frontend Scaffolding & Layout**

* Initialize `/frontend` using Vite + React + TypeScript.
* Configure Tailwind CSS and setup the main Dashboard layout with a sidebar (Dashboard, Ingredients, Menus, POS).

**Step 5: Frontend Views & API Integration**

* Create the Ingredients management table and the POS grid interface where users can select menus and checkout.

Let's start with **Step 1**. Please generate the setup for the `/backend` directory.

```

***

### 🛠️ Langkah Persiapan Sebelum Menjalankan Prompt:
Agar AI tidak bingung menaruh file-filenya, ada baiknya Anda membuat folder utama terlebih dahulu di komputer Anda, lalu buka folder tersebut di VS Code / Cursor:

1. Buat folder kosong, misalnya: `pos-app`.
2. Buka folder `pos-app` tersebut di Editor (Cursor/Windsurf).
3. Masukkan *mega-prompt* di atas ke fitur Chat AI.

AI akan langsung otomatis membuat folder `/backend` di dalam proyek Anda dan mulai mengisinya dengan struktur NestJS yang rapi. Selamat *vibe coding*! Jika ada kendala di tengah jalan saat kodingan digenerate, beri tahu saya.

```