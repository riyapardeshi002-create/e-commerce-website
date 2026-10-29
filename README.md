# 👟 SOLE — Full-Stack Shoe E-commerce Platform
### College Cloud Computing Project • React + Node.js Express + PostgreSQL + Prisma + Render

![SOLE Brand](https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80)

---

## 📌 1. Project Overview

**SOLE** is a modern, responsive, full-stack footwear and sneaker e-commerce web application. Developed as a **College Cloud Computing project**, it demonstrates modern cloud-native architectural patterns:
- **Client Tier**: React with Vite, styled with Tailwind CSS and Lucide React icons.
- **Application Tier**: RESTful API built with Node.js and Express.js, featuring rate limiting, secure HTTP headers, and centralized error handling.
- **Data Tier**: Relational PostgreSQL database managed via Prisma ORM, utilizing ACID transactions for atomic order creation and inventory deduction.
- **Authentication**: JWT token storage strategy using HTTP-only cookies and Bearer fallback, with secure salted password hashing using bcrypt.
- **Cloud Infrastructure**: Cloud deployment on **Render** (Render Static Site for frontend, Render Web Service for backend, and Render Managed PostgreSQL DBaaS).

---

## ⚡ 2. Technology Stack

| Component | Technology | Role / Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + Vite | High-performance SPA with instant HMR and optimized production build |
| **Styling** | Tailwind CSS v3 | Luxury sneaker brand aesthetic, responsive layouts, utility classes |
| **Icons** | Lucide React | Consistent, scalable vector icon library |
| **Visual Analytics** | Recharts | Sales trend area charts and order distribution donut charts for admin |
| **Backend Runtime** | Node.js (v20+) | Event-driven server runtime |
| **Web Framework** | Express.js | Robust routing, middleware pipeline, and RESTful endpoints |
| **Database** | PostgreSQL | Relational database with foreign keys, indexes, and constraints |
| **ORM** | Prisma ORM | Type-safe queries, relational data modeling, migrations, and seeding |
| **Security & Auth** | bcryptjs + jsonwebtoken | 12-round salted password hashing & signed JWT tokens |
| **Cloud Deployment** | Render | Static Site + Node Web Service + Managed PostgreSQL Database |

---

## 🗄️ 3. Relational Database Schema Design (Prisma)

The application models footwear e-commerce relationships with strict referential integrity, indexes, and cascading rules:

```mermaid
erDiagram
    User ||--o{ Order : places
    User ||--o{ CartItem : owns
    User ||--o{ WishlistItem : saves
    Order ||--|{ OrderItem : contains
    Product ||--|{ ProductSize : offers
    Product ||--o{ ProductImage : showcases
    Product ||--o{ CartItem : added_as
    Product ||--o{ WishlistItem : bookmarked_as
    Product ||--o{ OrderItem : purchased_as

    User {
        string id PK
        string name
        string email UK
        string passwordHash
        string role
        datetime createdAt
        datetime updatedAt
    }

    Product {
        string id PK
        string name
        string slug UK
        string brand
        string category
        decimal price
        decimal salePrice
        string imageUrl
        boolean featured
        datetime createdAt
    }

    ProductSize {
        string id PK
        string productId FK
        float size
        int stockQuantity
    }

    CartItem {
        string id PK
        string userId FK
        string productId FK
        float size
        int quantity
    }

    Order {
        string id PK
        string orderNumber UK
        string userId FK
        string customerName
        string phone
        string deliveryAddress
        decimal subtotal
        decimal shippingCost
        decimal totalAmount
        string status
        datetime createdAt
    }

    OrderItem {
        string id PK
        string orderId FK
        string productId FK
        string productNameSnapshot
        float size
        int quantity
        decimal unitPrice
        decimal lineTotal
    }
```

### Key Schema Design Decisions:
1. **Price Snapshots (`productNameSnapshot` & `unitPrice` in OrderItem)**: When product prices change in the future, past order invoices remain immutable and historically accurate.
2. **Shoe Size Variants (`product_sizes` with `[productId, size]` unique constraint)**: Inventory is managed specifically per shoe size (e.g., Size 8 vs Size 10).
3. **Cart Variants (`[userId, productId, size]` unique constraint)**: Adding the same shoe in a different size creates distinct cart variants rather than overwriting.
4. **Atomic Transactions (`prisma.$transaction`)**: When an order is placed, stock verification, stock decrement, order record creation, and cart emptying occur in an atomic ACID transaction to prevent overselling.

---

## 🚀 4. API Endpoints Reference

### Health & Monitoring
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System status, database latency, server uptime |

### Authentication
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new customer account (rate-limited) |
| `POST` | `/api/auth/login` | Public | Sign in and receive secure authentication session |
| `POST` | `/api/auth/logout` | Authenticated | Invalidate session and clear auth cookie |
| `GET` | `/api/auth/me` | Authenticated | Verify active session, return user profile & counts |

### Products Catalogue
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | Search, category, brand, size, price filters, sorting |
| `GET` | `/api/products/:id` | Public | Get shoe details by UUID with all size stock levels |
| `GET` | `/api/products/slug/:slug` | Public | Get shoe details by SEO slug with related products |
| `POST` | `/api/products` | Admin | Add new shoe model with sizes and stock |
| `PUT` | `/api/products/:id` | Admin | Update shoe details, prices, or restock sizes |
| `DELETE` | `/api/products/:id` | Admin | Delete shoe model and associated variants |

### Shopping Cart (Database Persisted)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Customer | Fetch current bag, verify stock, calculate subtotal & shipping |
| `POST` | `/api/cart` | Customer | Add shoe size variant with stock ceiling validation |
| `PATCH` | `/api/cart/:id` | Customer | Increment / decrement quantity within available inventory |
| `DELETE` | `/api/cart/:id` | Customer | Remove line item from bag |

### Wishlist
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/wishlist` | Customer | Fetch customer's saved sneakers |
| `POST` | `/api/wishlist` | Customer | Toggle shoe in customer wishlist |
| `DELETE` | `/api/wishlist/:id` | Customer | Remove shoe from wishlist |

### Orders & Demo Checkout
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Customer | Atomic demo checkout transaction (deducts stock) |
| `GET` | `/api/orders/my-orders`| Customer | Get customer's past orders with status and snapshots |
| `GET` | `/api/orders/:id` | Customer / Admin | Get specific order invoice and delivery information |

### Admin Dashboard & Management
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Admin | Revenue totals, orders count, low-stock alerts, Recharts trends |
| `GET` | `/api/admin/orders` | Admin | Search all customer orders and filter by fulfillment status |
| `PATCH` | `/api/admin/orders/:id/status` | Admin | Update status: `Pending`, `Confirmed`, `Shipped`, `Delivered`, `Cancelled` |
| `GET` | `/api/admin/customers` | Admin | View registered customer roster |

---

## 🔑 5. Pre-Configured Demo Credentials

The database seed script automatically creates two default accounts for immediate academic grading and demonstration:

### 1. Store Administrator Account
- **Email**: `admin@sole.store`
- **Password**: `Admin@12345`
- **Role**: `admin`
- **Access**: Full Admin Dashboard, Inventory CRUD, Order Status Management, Analytics.

### 2. Demo Customer Account
- **Email**: `customer@sole.store`
- **Password**: `Customer@12345`
- **Role**: `customer`
- **Access**: Storefront shopping, bag, wishlist, demo checkout, order tracking.

*(In the web interface, the Sign In modal also includes **1-Click Quick Demo Login** buttons for instantaneous testing).*

---

## 💻 6. Local Setup and Development

### Prerequisites
- Node.js (v18 or v20+)
- PostgreSQL (v14+) or Docker PostgreSQL container

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/sole-store.git
cd sole-store
```

### Step 2: Configure Environment Variables

**Backend (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/sole_store?schema=public"
JWT_SECRET=your_32_character_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@sole.store
ADMIN_PASSWORD=Admin@12345
```

**Frontend (`client/.env`):**
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Step 3: Install Dependencies
```bash
# Root helper
npm run install:all

# Or manually:
cd server && npm install
cd ../client && npm install
```

### Step 4: Run Database Migrations and Seed Data
```bash
cd server
npx prisma generate
npx prisma db push
node prisma/seed.js
```

### Step 5: Start the Development Servers
In Terminal 1 (Backend):
```bash
cd server
npm run dev
# Server runs at http://localhost:5000
# Health check at http://localhost:5000/api/health
```

In Terminal 2 (Frontend):
```bash
cd client
npm run dev
# Storefront opens at http://localhost:5173
```

---

## ☁️ 7. Render Cloud Deployment Guide (Step-by-Step)

The project is structured specifically for **Render Blueprint (`render.yaml`)** or manual multi-service deployment.

### Option A: 1-Click Render Blueprint Deployment
1. Push your repository to GitHub.
2. Sign in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Blueprint**.
4. Connect your GitHub repository.
5. Render reads `render.yaml` and will automatically provision:
   - **PostgreSQL Database** (`sole-postgres`)
   - **Node.js Web Service** (`sole-server`)
   - **Static Site** (`sole-client`)
6. Click **Apply**.
7. Once deployed, open the backend web service shell on Render and run the seed script:
   ```bash
   node prisma/seed.js
   ```

---

### Option B: Step-by-Step Manual Deployment on Render

#### Step 1: Create Render PostgreSQL Database
1. In Render Dashboard, click **New +** -> **PostgreSQL**.
2. Set Name: `sole-postgres`.
3. Set Database Name: `sole_store`.
4. Set User: `sole_user`.
5. Select Region (e.g. `Oregon (US West)` or nearest).
6. Plan: **Free**.
7. Click **Create Database**.
8. Once provisioned, copy the **Internal Database URL** (for services hosted inside Render) or **External Database URL**.

#### Step 2: Deploy the Backend Web Service
1. Click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Name**: `sole-server`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
4. Add **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `DATABASE_URL`: *(Paste your Render PostgreSQL connection string)*
   - `JWT_SECRET`: *(A random 32+ character string)*
   - `CLIENT_URL`: `https://sole-client.onrender.com` *(Your frontend URL)*
   - `ADMIN_EMAIL`: `admin@sole.store`
   - `ADMIN_PASSWORD`: `Admin@12345`
5. Click **Create Web Service**.
6. Once deployed, run the seed script via the Render **Shell** tab:
   ```bash
   node prisma/seed.js
   ```

#### Step 3: Deploy the Frontend Static Site
1. Click **New +** -> **Static Site**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Name**: `sole-client`
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add **Environment Variable**:
   - `VITE_API_BASE_URL`: `https://sole-server.onrender.com/api` *(Your Render backend URL + `/api`)*
5. Add **Rewrite Rule** under Redirects/Rewrites:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`
6. Click **Create Static Site**.

---

## 🧪 8. API Verification with cURL

You can test every layer of the API from the command line:

### Health Check
```bash
curl -X GET http://localhost:5000/api/health
```

### Fetch Products with Filters
```bash
curl -X GET "http://localhost:5000/api/products?category=Running&limit=4"
```

### Customer Authentication
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@sole.store","password":"Customer@12345"}'
```

### Admin Dashboard (Requires Token)
```bash
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

---

## 💡 9. Cloud Computing Concepts Demonstrated

This project serves as a comprehensive real-world demonstration of fundamental cloud computing and distributed web application principles:

1. **Multi-Tier Decoupled Architecture**: Separation of Presentation Tier (Vite Static CDN), Application Tier (PaaS Compute), and Persistence Tier (DBaaS).
2. **Database as a Service (DBaaS)**: Managed relational storage on Render PostgreSQL featuring automated connection pooling, SSL encryption, and high availability.
3. **Stateless Compute**: Backend instances store zero session state on the local filesystem, enabling horizontal scaling and rapid redeployment.
4. **ACID Relational Integrity**: High-concurrency inventory decrement and order creation protected by PostgreSQL database transactions (`BEGIN ... COMMIT / ROLLBACK`).
5. **Cross-Origin Resource Sharing (CORS) & Token Security**: Secure cookie policies (`SameSite: None`, `Secure: true`) combined with Authorization Bearer header fallback.
6. **Platform Cold Start Management**: Handling free-tier cloud sleep states gracefully through client-side loading indicators and health ping endpoints.

---

## 📜 10. License & Academic Attribution
Developed for college academic demonstration in **Cloud Computing & Modern Web Architecture**.
Free for educational reference and coursework demonstration.
