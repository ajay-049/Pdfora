import React, { useState, useEffect } from 'react';
import { FileText, Download, RefreshCw, Type, Settings, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import Button from '../components/ui/Button';

interface TextToPDFSettings {
  fontSize: number;
  fontFamily: 'helvetica' | 'times' | 'courier';
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
  margin: number;
  pageSize: 'a4' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
}

export default function TextToPDF() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<TextToPDFSettings>({
    fontSize: 12,
    fontFamily: 'helvetica',
    textAlign: 'left',
    lineHeight: 1.5,
    margin: 20,
    pageSize: 'a4',
    orientation: 'portrait'
  });
  const [pdfResult, setPdfResult] = useState<Uint8Array | null>(null);

  useEffect(() => {
    // SEO Meta tags
    document.title = 'Text to PDF Converter - Free Online Tool | PDFora';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Convert text to PDF online for free. Create PDF documents from plain text with custom formatting options. No signup required.');
    }

    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Text to PDF Converter",
      "url": "https://pdfora.com/text-to-pdf",
      "description": "Free online text to PDF converter tool",
      "applicationCategory": "Utility",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0"
      },
      "featureList": [
        "Convert text to PDF",
        "Custom formatting",
        "Multiple fonts",
        "Text alignment options",
        "Page size options"
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

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
    if (event.target.value.trim() && step === 1) {
      setStep(2);
    }
  };

  const createTextToPDF = async (text: string, settings: TextToPDFSettings): Promise<Uint8Array> => {
    const pdf = new jsPDF({
      orientation: settings.orientation,
      unit: 'mm',
      format: settings.pageSize
    });

    // Set font
    pdf.setFont(settings.fontFamily);
    pdf.setFontSize(settings.fontSize);

    // Get page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const textWidth = pageWidth - (settings.margin * 2);

    // Split text into lines that fit the page width
    const lines = pdf.splitTextToSize(text, textWidth);
    
    let currentY = settings.margin;
    const lineHeightMm = settings.fontSize * 0.352778 * settings.lineHeight; // Convert pt to mm

    for (let i = 0; i < lines.length; i++) {
      // Check if we need a new page
      if (currentY + lineHeightMm > pageHeight - settings.margin) {
        pdf.addPage();
        currentY = settings.margin;
      }

      // Set text alignment
      let textX = settings.margin;
      if (settings.textAlign === 'center') {
        textX = pageWidth / 2;
      } else if (settings.textAlign === 'right') {
        textX = pageWidth - settings.margin;
      }

      // Add text to PDF
      pdf.text(lines[i], textX, currentY, { 
        align: settings.textAlign === 'left' ? undefined : settings.textAlign 
      });
      
      currentY += lineHeightMm;
    }

    return new Uint8Array(pdf.output('arraybuffer') as ArrayBuffer);
  };

  const handleConvert = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to convert');
      return;
    }

    try {
      setIsProcessing(true);
      const result = await createTextToPDF(text, settings);
      setPdfResult(result);
      setStep(3);
      toast.success('Text converted to PDF successfully!');
    } catch (error) {
      console.error('Error converting text to PDF:', error);
      toast.error('Failed to convert text to PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (pdfResult) {
      const blob = new Blob([pdfResult], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'text-to-pdf-converted.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const resetAll = () => {
    setStep(1);
    setText('');
    setPdfResult(null);
    setSettings({
      fontSize: 12,
      fontFamily: 'helvetica',
      textAlign: 'left',
      lineHeight: 1.5,
      margin: 20,
      pageSize: 'a4',
      orientation: 'portrait'
    });
  };

  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = text.length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Type className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Text to PDF Converter - Free Online Tool
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Convert your text into professional PDF documents instantly. Type or paste your text, customize the formatting, 
            and download as a high-quality PDF. Perfect for documents, notes, and reports.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span>✓ Custom Formatting</span>
            <span>✓ Multiple Fonts</span>
            <span>✓ Text Alignment</span>
            <span>✓ Page Size Options</span>
            <span>✓ 100% Free</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center mb-6">
                <FileText className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Enter Your Text</h3>
              </div>
              
              <textarea
                value={text}
                onChange={handleTextChange}
                placeholder="Type or paste your text here..."
                className="w-full h-96 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.5' }}
              />
              
              <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                <div className="flex gap-4">
                  <span>{charCount} characters</span>
                  <span>{wordCount} words</span>
                </div>
                {text.trim() && (
                  <Button
                    onClick={() => setStep(2)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Continue to Formatting
                  </Button>
                )}
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
              {/* Text Preview */}
              <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Text Preview</h3>
                    <Button
                      onClick={() => setStep(1)}
                      variant="secondary"
                      size="sm"
                    >
                      Edit Text
                    </Button>
                  </div>
                  
                  <div 
                    className="border border-gray-200 rounded-lg p-4 h-96 overflow-y-auto bg-white"
                    style={{
                      fontFamily: settings.fontFamily === 'helvetica' ? 'Arial, sans-serif' : 
                                 settings.fontFamily === 'times' ? 'Times, serif' : 
                                 'Courier, monospace',
                      fontSize: `${settings.fontSize}px`,
                      lineHeight: settings.lineHeight,
                      textAlign: settings.textAlign,
                      margin: `${settings.margin}px`
                    }}
                  >
                    {text.split('\n').map((line, index) => (
                      <div key={index} style={{ marginBottom: '0.5em' }}>
                        {line || '\u00A0'}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-500">
                    <span>{charCount} characters • {wordCount} words</span>
                  </div>
                </div>
              </div>

              {/* Settings Panel */}
              <div className="bg-white p-6 rounded-xl shadow-sm h-fit">
                <div className="flex items-center mb-6">
                  <Settings className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">PDF Settings</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Font Settings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Font Family
                    </label>
                    <select
                      value={settings.fontFamily}
                      onChange={(e) => setSettings(s => ({ ...s, fontFamily: e.target.value as 'helvetica' | 'times' | 'courier' }))}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="helvetica">Helvetica (Sans-serif)</option>
                      <option value="times">Times (Serif)</option>
                      <option value="courier">Courier (Monospace)</option>
                    </select>
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Font Size: {settings.fontSize}pt
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="24"
                      value={settings.fontSize}
                      onChange={(e) => setSettings(s => ({ ...s, fontSize: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>8pt</span>
                      <span>24pt</span>
                    </div>
                  </div>

                  {/* Text Alignment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Text Alignment
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'left', icon: AlignLeft, label: 'Left' },
                        { key: 'center', icon: AlignCenter, label: 'Center' },
                        { key: 'right', icon: AlignRight, label: 'Right' }
                      ].map((align) => (
                        <button
                          key={align.key}
                          onClick={() => setSettings(s => ({ ...s, textAlign: align.key as 'left' | 'center' | 'right' }))}
                          className={`p-3 rounded-lg border transition-all flex flex-col items-center ${
                            settings.textAlign === align.key
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <align.icon className="w-4 h-4 mb-1" />
                          <span className="text-xs">{align.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Line Height */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Line Height: {settings.lineHeight}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.1"
                      value={settings.lineHeight}
                      onChange={(e) => setSettings(s => ({ ...s, lineHeight: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1.0</span>
                      <span>3.0</span>
                    </div>
                  </div>

                  {/* Page Settings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Page Size
                    </label>
                    <select
                      value={settings.pageSize}
                      onChange={(e) => setSettings(s => ({ ...s, pageSize: e.target.value as 'a4' | 'letter' | 'legal' }))}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="a4">A4 (297×210 mm)</option>
                      <option value="letter">Letter (8.5×11 in)</option>
                      <option value="legal">Legal (8.5×14 in)</option>
                    </select>
                  </div>

                  {/* Orientation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Orientation
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['portrait', 'landscape'].map((orientation) => (
                        <button
                          key={orientation}
                          onClick={() => setSettings(s => ({ ...s, orientation: orientation as 'portrait' | 'landscape' }))}
                          className={`p-3 text-center rounded-lg border transition-all ${
                            settings.orientation === orientation
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {orientation.charAt(0).toUpperCase() + orientation.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleConvert}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                  disabled={isProcessing || !text.trim()}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Converting to PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Convert to PDF
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center bg-white rounded-xl shadow-sm p-8"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900">
                Text to PDF Conversion Complete!
              </h2>
              <p className="text-gray-600 mb-6">
                Your text has been successfully converted to PDF with {wordCount} words
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleDownload}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download PDF
                </Button>
                <Button
                  onClick={resetAll}
                  variant="secondary"
                  className="px-8 py-3"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Convert More Text
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEO Content */}
        <div className="mt-16 bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6">Why Choose Our Text to PDF Converter?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✍️</span>
              </div>
              <h3 className="font-semibold mb-2">Rich Formatting</h3>
              <p className="text-gray-600 text-sm">Customize fonts, sizes, alignment, and spacing for professional-looking documents</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">👁️</span>
              </div>
              <h3 className="font-semibold mb-2">Live Preview</h3>
              <p className="text-gray-600 text-sm">See exactly how your PDF will look before converting with real-time preview</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="font-semibold mb-2">Instant Conversion</h3>
              <p className="text-gray-600 text-sm">Convert your text to PDF instantly with no waiting time or file size limits</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}