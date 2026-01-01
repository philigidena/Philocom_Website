# Philocom Portfolio - Deployment Guide

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│         Frontend (Vercel)                │
│      React + Vite + Tailwind             │
│      Domain: philocom.co                 │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│      API Gateway (AWS)                   │
│      REST API Endpoints                  │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│      Lambda Functions (AWS)              │
│      Node.js 20.x Handlers               │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│      DynamoDB + S3 + SES (AWS)          │
└─────────────────────────────────────────┘
```

---

## 📋 Prerequisites

- [x] Node.js 18+ installed
- [x] AWS CLI configured with credentials
- [x] Terraform installed
- [x] Vercel CLI installed (optional)
- [x] GoDaddy domain (philocom.co)

---

## 🚀 Deployment Steps

### **Step 1: Deploy Backend Infrastructure**

```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init

# Review the deployment plan
terraform plan

# Deploy infrastructure
terraform apply -auto-approve

# Save the outputs (API Gateway URL, etc.)
terraform output > ../outputs.txt
```

**What this creates:**
- ✅ 5 DynamoDB tables (Projects, Testimonials, Contacts, Newsletter, Blog)
- ✅ 5 Lambda functions (API handlers)
- ✅ API Gateway with REST endpoints
- ✅ S3 bucket for images
- ✅ SES email service configuration

---

### **Step 2: Build and Deploy Lambda Functions**

```bash
# Navigate to backend directory
cd ../backend

# Install dependencies
npm install

# Build Lambda functions
npm run build

# Package functions (creates lambda_functions.zip)
cd dist
zip -r ../lambda_functions.zip .

# Upload to Lambda (manual or via Terraform)
# Terraform will auto-deploy on next apply
cd ..
```

---

### **Step 3: Verify SES Email Addresses**

```bash
# Check SES verification status
aws ses list-identities --region eu-central-1

# If not verified, check your email for verification link
# Verify: noreply@philocom.co and admin@philocom.co
```

**Important:** SES starts in sandbox mode. To send to any email:
1. Go to AWS Console → SES
2. Request production access
3. Verify your domain (optional but recommended)

---

### **Step 4: Seed Database with Sample Data**

```bash
# Navigate to backend/scripts
cd backend/scripts

# Run seed script (you'll create this)
node seed-data.js
```

Create `seed-data.js`:
```javascript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'eu-central-1' });
const docClient = DynamoDBDocumentClient.from(client);

// Add your project data here
const projects = [
  {
    id: 'proj-1',
    title: 'Your Project Name',
    description: '...',
    // ... other fields
  }
];

// Insert data
for (const project of projects) {
  await docClient.send(new PutCommand({
    TableName: 'philocom-dev-projects',
    Item: project
  }));
}
```

---

### **Step 5: Deploy Frontend to Vercel**

```bash
# Navigate to project root
cd ../..

# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts:
# - Link to existing project? N
# - Project name: philocom
# - Directory: ./
# - Build command: npm run build
# - Output directory: dist
```

**Or use GitHub integration:**
1. Push code to GitHub
2. Import repo in Vercel dashboard
3. Configure build settings
4. Deploy automatically

---

### **Step 6: Configure Custom Domain**

#### **In GoDaddy:**
1. Go to DNS Management for philocom.co
2. Add these DNS records (from Vercel dashboard):

```
Type    Name    Value                           TTL
CNAME   www     cname.vercel-dns.com           1 Hour
A       @       76.76.21.21                    1 Hour
```

#### **In Vercel:**
1. Project Settings → Domains
2. Add Domain: `philocom.co`
3. Add Domain: `www.philocom.co`
4. Wait for DNS propagation (5-60 minutes)

---

### **Step 7: Environment Variables**

#### **Vercel (Frontend):**
1. Go to Project Settings → Environment Variables
2. Add:

```
VITE_API_BASE_URL = https://xxx.execute-api.eu-central-1.amazonaws.com/dev
VITE_AWS_REGION = eu-central-1
```

#### **AWS Lambda (Backend):**
Already configured via Terraform! ✅

---

### **Step 8: Test Everything**

```bash
# Test API endpoints
curl https://your-api-url/dev/projects
curl https://your-api-url/dev/testimonials

# Test contact form (POST request)
curl -X POST https://your-api-url/dev/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Hello"}'

# Check DynamoDB for data
aws dynamodb scan --table-name philocom-dev-contacts --region eu-central-1
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: hashicorp/setup-terraform@v2
      - run: cd terraform && terraform init
      - run: cd terraform && terraform apply -auto-approve
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

---

## 📊 Monitoring & Maintenance

### **CloudWatch Logs**
```bash
# View Lambda logs
aws logs tail /aws/lambda/philocom-dev-contact-handler --follow

# View API Gateway logs
aws logs tail /aws/apigateway/philocom-dev-api --follow
```

### **DynamoDB Metrics**
- AWS Console → DynamoDB → philocom-dev-* → Metrics

### **Cost Monitoring**
- AWS Console → Billing Dashboard
- Set up billing alerts for $5, $10, $25

---

## 🛠️ Troubleshooting

### **Lambda Function Not Working**
- Check CloudWatch Logs
- Verify IAM permissions
- Ensure environment variables are set

### **CORS Issues**
- Check API Gateway CORS configuration
- Verify `Access-Control-Allow-Origin` header
- Update `CORS_ORIGIN` environment variable

### **Email Not Sending**
- Verify SES email addresses
- Check SES sandbox status
- Review CloudWatch Logs for SES errors

### **Domain Not Working**
- Wait for DNS propagation (up to 48 hours)
- Use `dig philocom.co` to check DNS records
- Verify Vercel domain configuration

---

## 💰 Cost Estimate

**Monthly costs (within AWS Free Tier):**
- Lambda: $0 (1M requests free)
- DynamoDB: $0 (25GB + 200M requests free)
- API Gateway: $0 (1M requests free)
- S3: $0 (5GB free)
- SES: $0 (62K emails free)
- **Vercel**: Free (Hobby plan)
- **Domain**: ~$12/year (GoDaddy)

**Total: ~$1/month** (after first year domain cost)

---

## 📝 Next Steps

1. ✅ Set up monitoring alerts
2. ✅ Configure backups for DynamoDB
3. ✅ Add custom error pages
4. ✅ Implement rate limiting
5. ✅ Add reCAPTCHA to forms
6. ✅ Set up CDN for S3 images (CloudFront)
7. ✅ Implement admin dashboard (future)

---

## 🤝 Support

For issues or questions:
- Email: admin@philocom.co
- GitHub Issues: [Create an issue]
- Documentation: [Link to docs]

---

**Built with ❤️ by Philocom Technology Team**
