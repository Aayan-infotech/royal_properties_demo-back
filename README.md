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

# 📌 Project Description

Royal Properties Backend is a scalable and secure API system powering a next-generation real estate platform focused on the Canadian market (Ontario & British Columbia).

It is designed to provide transparent property data, AI-driven valuation insights, rental ROI analytics, and MLS-backed listing accuracy — all within a modular, production-ready backend architecture.

---

# ✨ Core Features

- 🔐 Secure JWT Authentication (Access + Refresh Tokens)
- 👥 Role-Based Access Control (Admin, Agent, Buyer, Seller)
- 🏡 Property Listing & Management System
- 📊 Sold Price History Transparency
- 📈 Rental ROI Analytics
- 🧠 AI-Based Property Valuation Support
- ☁️ AWS S3 File Upload Integration
- 📧 Email Notification System
- 📌 Watchlist Management
- 📬 Enquiry Workflow Management
- ⚙️ Environment-Based Configuration
- 🐳 Docker Support
- 🔄 CI/CD Ready (Jenkins)

---

# 🏗 Architecture Highlights

- Modular NestJS Architecture  
- Clean Separation of Concerns  
- Dependency Injection Pattern  
- DTO-based Validation Layer  
- Global Exception Handling  
- Standardized API Response Interceptor  
- Production-Ready Code Structure  

---

# 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | NestJS 11 |
| Language | TypeScript |
| Database | MongoDB (Mongoose) |
| Authentication | JWT + Passport |
| Cloud Storage | AWS S3 |
| DevOps | Docker + Jenkins |
| Validation | class-validator |
| Architecture | Modular & Scalable |

---

# 📦 Main Dependencies

| Package | Purpose |
|----------|----------|
| @nestjs/common | Core NestJS utilities |
| @nestjs/core | NestJS framework core |
| @nestjs/platform-express | Express integration |
| @nestjs/config | Environment configuration |
| @nestjs/jwt | JWT authentication |
| @nestjs/passport | Passport integration |
| @nestjs/mongoose | MongoDB integration |
| mongoose | MongoDB ORM |
| @aws-sdk/client-s3 | AWS S3 client |
| @aws-sdk/client-secrets-manager | AWS Secrets Manager |
| bcrypt | Password hashing |
| class-validator | DTO validation |
| class-transformer | Transform request objects |
| passport | Authentication middleware |
| passport-jwt | JWT strategy |
| multer | File uploads |
| multer-s3 | Upload files to S3 |
| nodemailer | Email sending |
| reflect-metadata | Decorator metadata support |
| rxjs | Reactive programming support |

---

# 🛠 Development Dependencies

| Package | Purpose |
|----------|----------|
| @nestjs/cli | NestJS CLI |
| @nestjs/testing | Testing utilities |
| typescript | TypeScript support |
| ts-node | Run TypeScript directly |
| ts-jest | Jest + TypeScript support |
| jest | Testing framework |
| supertest | HTTP testing |
| eslint | Linting |
| prettier | Code formatting |
| @types/node | Node type definitions |
| @types/jest | Jest type definitions |
| @types/express | Express types |
| source-map-support | Improved stack traces |
| tsconfig-paths | Path mapping support |

---

# 🧪 Available Scripts

| Script | Purpose |
|--------|----------|
| npm run build | Build project |
| npm run start | Start application |
| npm run start:dev | Development mode |
| npm run start:debug | Debug mode |
| npm run start:prod | Production mode |
| npm run lint | Fix lint issues |
| npm run test | Run unit tests |
| npm run test:watch | Watch tests |
| npm run test:cov | Coverage report |
| npm run test:e2e | End-to-end tests |

---

# ⚙️ Installation

```bash
npm install
```

---

# ▶️ Running the Application

```bash
# Development
npm run start

# Watch mode
npm run start:dev

# Production
npm run start:prod
```

---

# 🌍 Environment Variables

Create a `.env` file:

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

⚠️ Never commit `.env` to version control.

---

# 🐳 Docker Support

```bash
docker build -t royal-properties-backend .
docker run -p 3000:3000 royal-properties-backend
```

---

# 📜 License

This project is proprietary and developed for Royal Properties.

---

<div align="center">

Built with precision by **Imtiyaz Hussain**

</div>