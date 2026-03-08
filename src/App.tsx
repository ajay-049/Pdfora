import { useState } from 'react';
import { FileText, FileDown, Image, ArrowLeft, Shield, Zap, Lock, Clock, Server, User, Scissors, Download, Type } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ToolCard from './components/ToolCard';
import LanguageToggle from './components/LanguageToggle';
import ImageToPDF from './pages/ImageToPDF';
import PngToPDF from './pages/PngToPDF';
import JpgToPDF from './pages/JpgToPDF';
import MergePDF from './pages/MergePDF';
import CompressPDF from './pages/CompressPDF';
import SplitPDF from './pages/SplitPDF';
import PDFToJPG from './pages/PDFToJPG';
import PDFToPNG from './pages/PDFToPNG';
import TextToPDF from './pages/TextToPDF';
import Auth from './pages/Auth';
import Footer from './components/Footer';
import './i18n';

type Tool = 'merge' | 'compress' | 'split' | 'imageTopdf' | 'pngToPdf' | 'jpgToPdf' | 'pdfToJpg' | 'pdfToPng' | 'textToPdf' | 'auth' | null;

function App() {
  const { t } = useTranslation();
  const [selectedTool, setSelectedTool] = useState<Tool>(null);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);

  const features = [
    {
      icon: Shield,
      title: t('features.secure.title'),
      description: t('features.secure.description')
    },
    {
      icon: Zap,
      title: t('features.fast.title'),
      description: t('features.fast.description')
    },
    {
      icon: Lock,
      title: t('features.private.title'),
      description: t('features.private.description')
    },
    {
      icon: Clock,
      title: t('features.autoDelete.title'),
      description: t('features.autoDelete.description')
    },
    {
      icon: Server,
      title: t('features.cloud.title'),
      description: t('features.cloud.description')
    }
  ];

  const renderTool = () => {
    switch (selectedTool) {
      case 'imageTopdf':
        return <ImageToPDF />;
      case 'pngToPdf':
        return <PngToPDF />;
      case 'jpgToPdf':
        return <JpgToPDF />;
      case 'merge':
        return <MergePDF />;
      case 'compress':
        return <CompressPDF />;
      case 'split':
        return <SplitPDF />;
      case 'pdfToJpg':
        return <PDFToJPG />;
      case 'pdfToPng':
        return <PDFToPNG />;
      case 'textToPdf':
        return <TextToPDF />;
      case 'auth':
        return <Auth onAuthSuccess={(userData) => {
          setUser(userData);
          setSelectedTool(null);
        }} />;
      default:
        return null;
    }
  };

  const showFooter = !selectedTool;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <Toaster position="top-center" />
      
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {selectedTool && (
                <button
                  onClick={() => setSelectedTool(null)}
                  className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title={t('common.back')}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 via-blue-600 to-green-600 text-transparent bg-clip-text">
                  PDFora
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-gray-600">Simple, fast, and secure PDF tools</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Welcome, {user.name}</span>
                  <button
                    onClick={() => setUser(null)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedTool('auth')}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Sign In</span>
                </button>
              )}
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {selectedTool ? (
          <div>
            {renderTool()}
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Every tool you need to work with PDFs in one place ok we can make it longer if you want.
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Every tool you need to use PDFs, All are 100% FREE and easy to use! 
                Merge, split, compress, convert, rotate PDFs with just a few clicks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              <ToolCard
                icon={Image}
                title={t('tools.imageToPDF.title')}
                description={t('tools.imageToPDF.description')}
                onClick={() => setSelectedTool('imageTopdf')}
              />
              
              {/* Specific image format tools */}
              <ToolCard
                icon={Image}
                title="PNG to PDF"
                description="Convert PNG images to PDF documents with transparency support"
                onClick={() => setSelectedTool('pngToPdf')}
              />
              
              <ToolCard
                icon={Image}
                title="JPG to PDF"
                description="Convert JPG/JPEG photos to PDF documents with high quality"
                onClick={() => setSelectedTool('jpgToPdf')}
              />
              
              <ToolCard
                icon={FileText}
                title={t('tools.mergePDF.title')}
                description={t('tools.mergePDF.description')}
                onClick={() => setSelectedTool('merge')}
              />
              
              <ToolCard
                icon={Scissors}
                title="Split PDF"
                description="Split PDF documents into separate pages or custom page ranges"
                onClick={() => setSelectedTool('split')}
              />
              
              <ToolCard
                icon={FileDown}
                title={t('tools.compressPDF.title')}
                description={t('tools.compressPDF.description')}
                onClick={() => setSelectedTool('compress')}
              />

              {/* PDF to Image tools */}
              <ToolCard
                icon={Download}
                title="PDF to JPG"
                description="Convert PDF pages to high-quality JPG images for sharing and editing"
                onClick={() => setSelectedTool('pdfToJpg')}
              />

              <ToolCard
                icon={Download}
                title="PDF to PNG"
                description="Convert PDF pages to PNG images with transparency support"
                onClick={() => setSelectedTool('pdfToPng')}
              />

              {/* Text to PDF tool */}
              <ToolCard
                icon={Type}
                title="Text to PDF"
                description="Convert plain text to professionally formatted PDF documents"
                onClick={() => setSelectedTool('textToPdf')}
              />

            </div>

            <section className="bg-white rounded-2xl shadow-sm p-8 mb-16">
              <h2 className="text-2xl font-bold text-center mb-8">Why Choose PDFora?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                      <p className="text-gray-600 mt-1">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {showFooter && <Footer />}
    </div>
  );
}

export default App