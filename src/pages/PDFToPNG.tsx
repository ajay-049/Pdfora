import React, { useState, useRef, useEffect } from 'react';
import { Image, Download, RefreshCw, FileText, Settings, Grid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { convertPDFToImages, downloadZip } from '../utils/pdf';
import Button from '../components/ui/Button';
import ProcessingOverlay from '../components/ProcessingOverlay';

interface ConversionSettings {
  quality: 'low' | 'medium' | 'high';
  format: 'png';
  scale: number;
  preserveTransparency: boolean;
}

interface ConvertedImage {
  id: string;
  pageNumber: number;
  dataUrl: string;
  filename: string;
}

export default function PDFToPNG() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<ConversionSettings>({
    quality: 'high',
    format: 'png',
    scale: 2,
    preserveTransparency: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // SEO Meta tags
    document.title = 'PDF to PNG Converter - Free Online Tool | PDFora';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Convert PDF to PNG images online for free. High-quality PDF to PNG conversion with transparency support. Extract all pages as PNG images. No signup required.');
    }

    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "PDF to PNG Converter",
      "url": "https://pdfora.com/pdf-to-png",
      "description": "Free online PDF to PNG converter tool",
      "applicationCategory": "Utility",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0"
      },
      "featureList": [
        "Convert PDF to PNG",
        "High quality output",
        "Transparency support",
        "Batch conversion",
        "Custom quality settings",
        "Download as ZIP"
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      // Cleanup
      document.head.removeChild(script);
    };
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    setFile(selectedFile);
    setStep(2);
    toast.success('PDF file loaded successfully');
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      const input = document.createElement('input');
      input.type = 'file';
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(droppedFile);
      input.files = dataTransfer.files;
      const event = { target: input } as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(event);
    } else {
      toast.error('Please drop a PDF file');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleConvert = async () => {
    if (!file) {
      toast.error('No file selected');
      return;
    }

    try {
      setIsProcessing(true);
      
      const images = await convertPDFToImages(file, settings);
      setConvertedImages(images);
      setStep(3);
      toast.success(`Successfully converted ${images.length} pages to PNG`);
    } catch (error) {
      console.error('Error converting PDF:', error);
      toast.error('Failed to convert PDF to PNG');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAll = () => {
    if (convertedImages.length === 0) return;
    
    downloadZip(convertedImages, `${file?.name?.replace('.pdf', '') || 'converted'}-png-images.zip`);
  };

  const handleDownloadSingle = (image: ConvertedImage) => {
    const link = document.createElement('a');
    link.href = image.dataUrl;
    link.download = image.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAll = () => {
    setStep(1);
    setFile(null);
    setConvertedImages([]);
  };

  const handleSelectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const qualityOptions = [
    { key: 'low', label: 'Low Quality', description: 'Smaller file size', scale: 1 },
    { key: 'medium', label: 'Medium Quality', description: 'Balanced size & quality', scale: 1.5 },
    { key: 'high', label: 'High Quality', description: 'Best quality, larger files', scale: 2 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <ProcessingOverlay visible={isProcessing} />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold mb-4 text-gray-900">PDF to PNG</h1>
              <p className="text-gray-600 mb-8">Extract pages from your PDF and convert them into high-quality PNG images with transparency.</p>
              
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer bg-white shadow-sm"
                onClick={handleSelectFile}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="mt-4 text-lg font-medium text-gray-700">
                  Drag & drop files here
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  or
                </p>
                <Button 
                  type="button" 
                  className="mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectFile();
                  }}
                >
                  Select PDF
                </Button>
                <p className="mt-4 text-xs text-gray-400">
                  Supports PDF format
                </p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* File Info */}
              <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center mb-6">
                    <FileText className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{file?.name}</h3>
                      <p className="text-sm text-gray-500">
                        {((file?.size || 0) / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                  </div>

                  <div className="text-center py-8">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Image className="w-12 h-12 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Ready to Convert</h4>
                    <p className="text-gray-600 mb-6">
                      Your PDF will be converted to high-quality PNG images with transparency support. Each page will become a separate PNG file.
                    </p>
                    <Button
                      onClick={() => setStep(1)}
                      variant="secondary"
                    >
                      Change File
                    </Button>
                  </div>
                </div>
              </div>

              {/* Settings Panel */}
              <div className="bg-white p-6 rounded-xl shadow-sm h-fit">
                <div className="flex items-center mb-6">
                  <Settings className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Conversion Settings</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Quality Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Image Quality
                    </label>
                    <div className="space-y-2">
                      {qualityOptions.map((option) => (
                        <button
                          key={option.key}
                          onClick={() => setSettings(s => ({ 
                            ...s, 
                            quality: option.key as 'low' | 'medium' | 'high',
                            scale: option.scale
                          }))}
                          className={`w-full p-3 text-left rounded-lg border transition-all ${
                            settings.quality === option.key
                              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                              : 'border-gray-200 hover:bg-gray-50 hover:border-blue-200'
                          }`}
                        >
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Transparency Option */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.preserveTransparency}
                        onChange={(e) => setSettings(s => ({ ...s, preserveTransparency: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Preserve transparency (recommended for PNG)
                      </span>
                    </label>
                  </div>

                  {/* Format Info */}
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-1">Output Format</h4>
                    <p className="text-sm text-blue-800">PNG format with lossless compression and transparency support</p>
                  </div>
                </div>

                <Button
                  onClick={handleConvert}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                  disabled={!file}
                >
                  <Image className="w-5 h-5 mr-2" />
                  Convert to PNG
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Results Header */}
              <div className="text-center bg-white rounded-xl shadow-sm p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Image className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900">
                  Conversion Complete!
                </h2>
                <p className="text-gray-600 mb-6">
                  Successfully converted {convertedImages.length} pages to PNG images
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleDownloadAll}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download All as ZIP
                  </Button>
                  <Button
                    onClick={resetAll}
                    variant="secondary"
                    className="px-8 py-3"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Convert Another PDF
                  </Button>
                </div>
              </div>

              {/* Image Gallery */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <Grid className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Converted Images ({convertedImages.length})
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {convertedImages.map((image) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="aspect-[3/4] relative">
                        <img
                          src={image.dataUrl}
                          alt={`Page ${image.pageNumber}`}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Page Number */}
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                          {image.pageNumber}
                        </div>

                        {/* Download Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            onClick={() => handleDownloadSingle(image)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {image.filename}
                        </p>
                        <p className="text-xs text-gray-500">
                          Page {image.pageNumber}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEO Content */}
        <div className="mt-16 bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6">Why Choose Our PDF to PNG Converter?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold mb-2">Transparency Support</h3>
              <p className="text-gray-600 text-sm">Convert PDF pages to PNG with full transparency support for graphics and logos</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="font-semibold mb-2">Lossless Quality</h3>
              <p className="text-gray-600 text-sm">PNG format preserves image quality without compression artifacts</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600 text-sm">Your PDF files are processed locally and automatically deleted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}