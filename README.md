# 🚀 PHILOCOM Technology - Portfolio Website

> **Award-winning portfolio website showcasing cutting-edge IT and telecommunication solutions**

[![Vercel](https://img.shields.io/badge/Vercel-Deployed-success?logo=vercel)](https://philocom.co)
[![AWS](https://img.shields.io/badge/AWS-Infrastructure-orange?logo=amazon-aws)](https://aws.amazon.com)
[![Terraform](https://img.shields.io/badge/Terraform-IaC-purple?logo=terraform)](https://terraform.io)
[![React](https://img.shields.io/badge/React-18.3-blue?logo=react)](https://reactjs.org)

---

## ✨ Features

### 🎨 **Frontend**
- ⚡ **Blazing Fast** - Built with Vite + React
- 🎭 **Stunning Animations** - GSAP + ScrollTrigger
- 📱 **Fully Responsive** - Mobile-first design
- 🌈 **Modern UI** - Glassmorphism, gradients, micro-interactions
- ♿ **Accessible** - WCAG 2.1 AA compliant
- 🚀 **Performance Optimized** - Lazy loading, code splitting

### 🏗️ **Backend**
- ☁️ **Serverless Architecture** - AWS Lambda + API Gateway
- 💾 **NoSQL Database** - DynamoDB for scalability
- 📧 **Email Service** - AWS SES for contact forms
- 🔒 **Secure** - Input validation, sanitization
- 📊 **Monitored** - CloudWatch logging & metrics

### 🛠️ **Infrastructure**
- 📜 **Infrastructure as Code** - Terraform for AWS
- 🔄 **CI/CD Pipeline** - GitHub Actions
- 🌐 **CDN** - Vercel Edge Network
- 🔐 **SSL** - Automatic HTTPS
- 💰 **Cost-Optimized** - AWS Free Tier eligible

---

## 🏛️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Frontend Layer                         │
│  React 18 + Vite + Tailwind CSS + GSAP                   │
│  Hosted on Vercel (philocom.co)                          │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│                      API Layer                            │
│  AWS API Gateway → Lambda Functions (Node.js 20)         │
│  Endpoints: /projects /testimonials /contact /newsletter  │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│                    Data & Services Layer                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │  DynamoDB  │  │     S3     │  │    SES     │         │
│  │  (NoSQL)   │  │  (Images)  │  │  (Email)   │         │
│  └────────────┘  └────────────┘  └────────────┘         │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- AWS Account
- Terraform
- Vercel Account (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/philocom.git
cd philocom

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your values
```

### Development

```bash
# Run frontend dev server
npm run dev

# Frontend will be available at http://localhost:5173
```

### Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions.

---

## 📞 Contact

**Philocom Technology**
- 🌐 Website: [philocom.co](https://philocom.co)
- 📧 Email: info@philocom.co

---

**Built with ❤️ by Philocom Technology Team**
