import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About PDFora</h3>
            <p className="text-gray-600">
              Free online PDF tools to help you merge, compress, and convert PDFs easily.
              Made with ❤️ India
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">PDF Tools</h3>
            <ul className="space-y-2 text-gray-600">
              <li><a href="/" className="hover:text-blue-600 transition-colors">Merge PDF</a></li>
              <li><a href="/" className="hover:text-blue-600 transition-colors">Compress PDF</a></li>
              <li><a href="/" className="hover:text-blue-600 transition-colors">Split PDF</a></li>
              <li><a href="/" className="hover:text-blue-600 transition-colors">Image to PDF</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Security</h3>
            <ul className="space-y-2 text-gray-600">
              <li><a href="https://pdfora.com/privacy-policy" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
              <li><a href="https://pdfora.com/terms-of-service" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
              <li><a href="/" className="hover:text-blue-600 transition-colors">Data Protection</a></li>
              <li><a href="/" className="hover:text-blue-600 transition-colors">File Security</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-600">
              <li><a href="mailto:contact@pdfora.com" className="hover:text-blue-600 transition-colors">Support</a></li>
              <li><a href="mailto:feedback@pdfora.com" className="hover:text-blue-600 transition-colors">Feedback</a></li>
              <li><a href="mailto:report@pdfora.com" className="hover:text-blue-600 transition-colors">Report Issue</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{t('common.madeInIndia')}</span>
            <span className="text-lg">🇮🇳</span>
          </div>
          <p className="text-sm text-gray-500">{t('common.autoDelete')}</p>
        </div>
      </div>
    </footer>
  );
}