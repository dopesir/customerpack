# Customer Pack — Self-Serve Digital Product
**Engineered by Nobuswork** · [https://nobuswork.pages.dev](https://nobuswork.pages.dev)

> *"Your customer's requirements, your rules."*

Customer Pack is a self-serve B2B digital utility designed for suppliers, fabricators, precision machine shops, and commercial contractors in India. It takes customer-specific vendor empanelment requirements, matches them against supplier statutory and banking documents, applies configurable consistency rules, runs preflight verification, and compiles a single, professional, indexed submission dossier with typeset letterhead undertakings.

---

## 🔄 Core Pipeline

```
CUSTOMER REQUIREMENT → SUPPLIER DOCUMENTS → CONFIGURABLE CHECKS → PREFLIGHT → SUBMISSION KIT
```

1. **Customer Requirement**: Upload the buyer's empanelment checklist, onboarding email, RFQ criteria, or vendor registration form (PDF, Word, Excel, or images). Gemini 1.5 Flash parses mandatory vs optional requirements, acceptable formats, and required declarations.
2. **Supplier Documents**: Drag & drop your statutory and banking documents (GST, PAN, Cancelled Cheque, MSME Udyam, etc.). Documents are auto-classified with confidence scores.
3. **Configurable Checks**: Configure verification rules according to the customer's actual acceptance criteria:
   - Mandatory and optional document presence
   - Cross-document legal name consistency
   - GSTIN ↔ PAN embedded string linkage (characters 3–12 match PAN)
   - Pre-printed cheque name check (with neutral B2B guidance if handwritten)
   - Expiration date thresholds (configurable window, default 30 days)
4. **Preflight Results**: 0–100 readiness score, discrepancy audit trail, and status badges (`MATCHED`, `MISSING`, `NEEDS_REVIEW`, `DRAFT_AVAILABLE`, `NOT_APPLICABLE`). Includes free instant downloadable Preflight Report PDF.
5. **Submission Kit**: Pre-filled letterhead undertakings (Non-Debarment, Anti-Bribery, Sole Proprietorship, MSME Applicability), sequential page numbering (`Page X of Y`), running headers/footers, Table of Contents, and single merged PDF dossier.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or 20+
- npm

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
```

### Automated Verification Suites
```bash
# Customer Pack End-to-End Test Suite (24 tests)
npx tsx scripts/test-customer-pack-e2e.ts

# Deterministic Validation Tests (11 tests)
npm run test:validation

# Serverless PDF Engine Tests
npm run test:pdf
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google Gemini API (Multimodal Requirement Extraction & OCR Classification)
GEMINI_API_KEY="your_gemini_api_key"

# Razorpay Payments (Live / Test) (Falls back to simulated UPI QR in dev mode if unconfigured)
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="your_razorpay_secret"

# Dynamic Pricing Configuration (INR)
NEXT_PUBLIC_PRICE_SINGLE="299"
NEXT_PUBLIC_PRICE_FIVE_PACK="799"

# Supabase Storage (Optional: In-memory store handles ephemeral sessions automatically)
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
```

---

## 🔒 Security & Ephemeral Privacy Architecture

- **No Account Required**: Direct private access link with a cryptographic 24-byte bearer token (`x-access-token`).
- **Magic Byte Inspection**: All uploaded files are checked for binary headers (`%PDF`, `JFIF`, `PNG`, `PK`).
- **Cryptographic Payment Verification**: Server-side HMAC SHA-256 signature verification. Safe failure in production if secrets are unconfigured.
- **Immediate Ephemeral Wipe**: 48-hour retention with 1-click **Delete This Pack** button that immediately purges in-memory records, database entries, and stored files.

---

## 🏢 About Nobuswork

Customer Pack is designed and engineered by **Nobuswork**.  
Learn more at [https://nobuswork.pages.dev](https://nobuswork.pages.dev).

© 2026 Nobuswork. All rights reserved. Customer Pack™ is a self-serve vendor submission utility.
