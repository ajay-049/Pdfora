# Pdfora — PDF Tools Web Application

> **Live:** https://proud-plant-0f03b0f10.4.azurestaticapps.net

![Azure Static Web Apps](https://img.shields.io/badge/Azure-Static_Web_Apps-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)
![React](https://img.shields.io/badge/React_18-TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Build_Tool-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![CI/CD](https://img.shields.io/badge/CI/CD-GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Status](https://img.shields.io/badge/Status-Live-28a745?style=for-the-badge)

---

## What is Pdfora?

Pdfora is a **browser-based PDF tools platform** that lets users process PDF files entirely on the client side — no file uploads to any server, no privacy concerns. Built and maintained as a solo project from idea to production.

### Features
- Image to PDF conversion
- PDF Merge (combine multiple PDFs)
- PDF Split (extract pages)
- PDF Compress
- PDF to JPG / PNG
- JPG / PNG to PDF
- Text to PDF

All processing happens **100% in the browser** using PDF.js and pdf-lib — zero server-side file handling.

---

## Architecture

```
Developer (VS Code)
        │
        │  git push
        ▼
   GitHub (main branch)
        │
        │  Triggers automatically
        ▼
  GitHub Actions CI/CD
        │
        ├── npm install
        ├── npm run build (Vite)
        └── Deploy to Azure
              │
              ▼
   Azure Static Web Apps
   (proud-plant-0f03b0f10.4.azurestaticapps.net)
              │
              ▼
         Live Site ✅
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 18 + TypeScript |
| Build Tool | Vite |
| PDF Processing | pdf-lib, PDF.js (browser-based) |
| Internationalization | i18n (multi-language support) |
| Cloud Hosting | Azure Static Web Apps |
| CI/CD | GitHub Actions |
| Version Control | Git + GitHub |
| Previous Hosting | Hostinger (shared hosting) |

---

## Cloud & DevOps Setup

### Azure Static Web Apps Deployment
- Migrated from **Hostinger shared hosting → Microsoft Azure**
- Hosted on **Azure Static Web Apps** (Free tier)
- Automatic HTTPS enabled
- Global CDN distribution

### CI/CD Pipeline (GitHub Actions)
Every push to `main` branch automatically triggers:

```
Push to main
     ↓
GitHub Actions triggered
     ↓
ubuntu-latest runner spins up
     ↓
npm install (dependencies)
     ↓
npm run build (Vite builds to /dist)
     ↓
Azure Static Web Apps deploy action
     ↓
Live in ~1 minute ✅
```

**Workflow file:** `.github/workflows/deploy.yml`

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          output_location: "dist"
```

---

## Project Structure

```
pdfora/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD pipeline
├── src/
│   ├── pages/
│   │   ├── CompressPDF.tsx
│   │   ├── ImageToPDF.tsx
│   │   ├── JpgToPDF.tsx
│   │   ├── MergePDF.tsx
│   │   ├── PDFToJPG.tsx
│   │   ├── PDFToPNG.tsx
│   │   ├── PngToPDF.tsx
│   │   ├── SplitPDF.tsx
│   │   └── TextToPDF.tsx
│   ├── i18n/
│   │   └── locales/            # Multi-language support
│   ├── utils/                  # PDF processing utilities
│   └── App.tsx
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Local Development

```bash
# Clone the repo
git clone https://github.com/ajay-049/pdfora.git
cd pdfora

# Install dependencies
npm install

# Start dev server
npm run dev
# Opens at http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Migration Journey

| Stage | Hosting | Status |
|-------|---------|--------|
| v1 | Hostinger Shared Hosting | Migrated ✅ |
| v2 | Azure Static Web Apps | Current ✅ |
| Next | Docker + Azure Container | Planned 🔜 |

### Why I Migrated from Hostinger to Azure
- **Hostinger:** Manual FTP uploads for every change — slow, error-prone
- **Azure + GitHub Actions:** Push code → auto build → auto deploy — professional workflow
- **Learning goal:** Hands-on with real Azure cloud services and CI/CD pipelines

---

## Upcoming Improvements

- [ ] Dockerize the app with multi-stage Nginx build
- [ ] Add Azure Application Insights for monitoring
- [ ] Terraform configuration for infrastructure as code
- [ ] Custom domain setup on Azure
- [ ] Unit tests in CI pipeline

---

## What I Learned Building & Deploying This

- Setting up **Azure Static Web Apps** from scratch
- Writing and debugging **GitHub Actions** YAML workflows
- Understanding **CI/CD pipeline** flow — trigger → build → deploy
- Managing **GitHub Secrets** for secure token storage
- Handling **Git branch divergence** and merge conflicts
- **React + TypeScript** component architecture
- Client-side **PDF processing** without any backend

---

## Author

**Ajay Gupta**
- LinkedIn: [linkedin.com/in/ajgupta01](https://linkedin.com/in/ajgupta01)
- GitHub: [github.com/ajay-049](https://github.com/ajay-049)
- Email: Ajaygupta805288@gmail.com
- Location: Lucknow, UP | Open to: Pune · Bangalore · Remote

---

*Built solo. Deployed on Azure. Automated with GitHub Actions.*