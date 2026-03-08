# PDFora - Free PDF Tools Online

[![Made in India](https://img.shields.io/badge/Made%20in-India-orange)](https://pdfora.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Learning Project](https://img.shields.io/badge/Learning%20Project-Azure%20Static%20Web%20Apps-blue)](https://azure.microsoft.com/en-us/products/app-service/static/)

> **Note**: This project was created as a learning exercise to demonstrate deployment to Azure Static Web Apps and CI/CD pipeline implementation. It's not intended for commercial use but serves as a portfolio project for resume purposes.

PDFora is a free, secure, and fast online PDF manipulation tool that allows you to convert, compress, merge, split, and edit PDF files directly in your browser. No signup required, no software installation needed. Your files are processed locally and automatically deleted after 30 minutes for maximum privacy.

This project showcases modern web development practices and cloud deployment using Azure Static Web Apps with automated CI/CD pipelines.

## 🌟 Features

### PDF Conversion Tools
- **Image to PDF**: Convert JPG, PNG, and HEIC images to high-quality PDFs
- **Text to PDF**: Transform plain text into formatted PDF documents
- **PDF to Image**: Convert PDF pages to JPG or PNG format
- **PDF to Word**: Convert PDFs to editable Word documents (Coming Soon!)

### PDF Manipulation
- **Merge PDFs**: Combine multiple PDF files into a single document
- **Split PDF**: Extract specific pages or split PDFs into separate files
- **Compress PDF**: Reduce file size while maintaining quality (Perfect for PAN card applications - under 1MB!)

### Key Benefits
- 🔒 **100% Secure**: Files are encrypted in transit and never stored on our servers
- ⚡ **Lightning Fast**: Advanced algorithms for quick processing
- 🛡️ **Private & Confidential**: Your data stays yours - we never store or share files
- 🗑️ **Auto Deletion**: All uploaded files are automatically deleted after 30 minutes
- 🌐 **No Installation**: Works directly in your browser
- 🇮🇳 **Made in India**: Proudly developed in India

## ☁️ Deployment & CI/CD

This project demonstrates modern cloud deployment practices using **Azure Static Web Apps** with automated CI/CD pipelines.

### Azure Static Web Apps Features Demonstrated
- **Static Site Hosting**: Serverless hosting for React applications
- **Global CDN**: Fast content delivery worldwide
- **Custom Domains**: Domain configuration and SSL certificates
- **API Integration**: Backend API capabilities (if needed)
- **Authentication**: Built-in authentication providers

### CI/CD Pipeline
- **GitHub Actions**: Automated build and deployment workflows
- **Build Triggers**: Automatic deployment on code changes
- **Environment Management**: Staging and production environments
- **Build Optimization**: Vite build process with asset optimization
- **Security Scanning**: Automated security checks

### Deployment Steps
1. **Connect Repository**: Link GitHub repository to Azure Static Web Apps
2. **Configure Build**: Set up build settings for React/Vite application
3. **Custom Domain**: Configure custom domain (pdfora.com)
4. **SSL Certificate**: Automatic HTTPS certificate provisioning
5. **Monitoring**: Application insights and performance monitoring

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/pdfora.git
cd pdfora
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with PostCSS
- **PDF Processing**: pdf-lib, jsPDF, PDF.js
- **Icons**: Lucide React
- **Internationalization**: i18next
- **Animations**: Framer Motion
- **File Handling**: react-dropzone, JSZip
- **Notifications**: react-hot-toast

## � Learning Outcomes

This project was built to demonstrate and learn:

### Azure & Cloud Skills
- **Azure Static Web Apps**: Deployment, configuration, and management
- **CI/CD Pipelines**: GitHub Actions integration with Azure
- **Cloud Architecture**: Serverless application design patterns
- **Domain Management**: Custom domain setup and SSL configuration

### Development Skills
- **Modern React**: Hooks, functional components, and best practices
- **TypeScript**: Type-safe development and interfaces
- **PDF Manipulation**: Client-side PDF processing libraries
- **Internationalization**: Multi-language support implementation
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### DevOps Skills
- **Automated Deployment**: Build triggers and release pipelines
- **Environment Management**: Staging and production workflows
- **Performance Optimization**: Build optimization and asset delivery
- **Security Best Practices**: Secure coding and deployment practices

## �📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, etc.)
│   ├── FileUpload.tsx  # File upload component
│   ├── ToolCard.tsx    # Tool selection cards
│   └── ...
├── pages/              # Individual tool pages
│   ├── ImageToPDF.tsx
│   ├── MergePDF.tsx
│   ├── CompressPDF.tsx
│   └── ...
├── utils/              # Utility functions
│   ├── pdf.ts         # PDF processing utilities
│   └── storage.ts     # Local storage helpers
├── i18n/               # Internationalization
│   ├── locales/       # Translation files
│   └── index.ts       # i18n configuration
└── App.tsx            # Main application component
```

## 🌍 Supported Languages

- English
- Hindi (हिंदी)

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies for learning purposes
- Demonstrates Azure Static Web Apps and CI/CD pipeline implementation
- Inspired by the need for accessible PDF tools and cloud deployment learning
- Made with ❤️ in India as a portfolio project

## 📞 Contact

- Website: [https://pdfora.com](https://pdfora.com)
- Email: contact@pdfora.com

---

**PDFora** - A learning project showcasing Azure Static Web Apps deployment and modern web development! 🇮🇳</content>
<parameter name="filePath">/home/ajay/my folder/newpdfora/project/README.md