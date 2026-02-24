<div align="center">

# 🏡 Royal Properties Backend

### Enterprise-Grade Real Estate Platform API  
Built with **NestJS 11 | TypeScript | MongoDB | AWS**

---

🚀 Scalable • 🔐 Secure • 🧠 AI-Driven • ☁️ Cloud Ready

</div>

---

## 👨‍💻 About the Developer

Hi, my name is **Imtiyaz Hussain**.  
I am a **Software Developer & Backend Engineer** passionate about building scalable, production-ready systems using modern technologies.

This project represents a modular, enterprise-ready backend architecture designed for real-world real estate platforms.

---

## 📌 Project Overview

Royal Properties Backend powers a next-generation real estate ecosystem focused on **Canada (Ontario & British Columbia)**.

The platform is built to:

- Increase real estate market transparency  
- Provide AI-powered valuation insights  
- Expose historical sold price data  
- Support investors with ROI analytics  
- Deliver secure, scalable APIs  

This backend follows clean architecture principles and enterprise development standards.

---

## 🎯 Core Vision

> To democratize real estate data by making accurate market intelligence accessible to everyone — not just agents.

---

## 🏗 Architecture Highlights

- Modular NestJS Architecture  
- Clean Separation of Concerns  
- Dependency Injection Pattern  
- DTO-based Validation Layer  
- Role-Based Access Control (RBAC)  
- Global Exception Handling  
- Standardized API Response Interceptor  
- Production-Ready Structure  

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | NestJS 11 |
| Language | TypeScript |
| Database | MongoDB (Mongoose) |
| Auth | JWT (Access + Refresh Tokens) |
| Cloud Storage | AWS S3 |
| DevOps | Docker + Jenkins |
| Validation | class-validator |
| Architecture | Modular & Scalable |

---

## 🔐 Security & Authentication

- JWT Authentication (Access + Refresh)
- `JwtAuthGuard` for route protection
- `RolesGuard` for RBAC enforcement
- DTO validation for request integrity
- Global error handling
- Secure environment configuration

---

## 🧠 Key Platform Capabilities

### 1️⃣ AI-Based Property Valuation
Estimates fair market value using pricing trends and MLS-backed data.

### 2️⃣ Sold Price History Transparency
Public visibility into historical sale prices — increasing trust and data transparency.

### 3️⃣ Rental ROI Analytics
Investment-focused insights including projected rental income and return analysis.

### 4️⃣ School Rankings & Neighborhood Insights
Fraser Institute rankings and community-level intelligence included with listings.

### 5️⃣ Tech-Enabled Brokerage Model
Data-driven platform supported by licensed agents for transaction finalization.

---

## 📂 Project Structure

```bash
src/
 ├── auth/              # Authentication & Authorization
 ├── agents/            # Agent management
 ├── buyers/            # Buyer management
 ├── sellers/           # Seller management
 ├── property/          # Property listings
 ├── property-extras/   # Property features
 ├── enquiry/           # Enquiry workflow
 ├── watchlists/        # Saved properties
 ├── faq/               # FAQ system
 ├── s3/                # AWS S3 integration
 ├── mail/              # Email service
 ├── map/               # Map integration
 ├── common/            # Filters, interceptors, utils
 ├── config/            # App & DB configuration
```

---

## ⚙️ Installation

```bash
npm install
```

---

## ▶️ Running the Application

### Development
```bash
npm run start
```

### Watch Mode
```bash
npm run start:dev
```

### Production
```bash
npm run start:prod
```

---

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### End-to-End Tests
```bash
npm run test:e2e
```

### Coverage
```bash
npm run test:cov
```

---

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGO_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
AWS_ACCESS_KEY=
AWS_SECRET_KEY=
AWS_REGION=
S3_BUCKET_NAME=
```

⚠️ Never commit your `.env` file to version control.

---

## 🐳 Docker Support

### Build Image
```bash
docker build -t royal-properties-backend .
```

### Run Container
```bash
docker run -p 3000:3000 royal-properties-backend
```

---

## 📜 License

This project is proprietary and developed for Royal Properties.

---

<div align="center">

Built with precision by **Imtiyaz Hussain**

</div>