import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ArrowLeft, ArrowRight, Download, RefreshCw, Trash2, Move } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { imagesToPDF, downloadPDF } from '../utils/pdf';
import Button from '../components/ui/Button';

interface PDFSettings {
  orientation: 'portrait' | 'landscape';
  pageSize: 'a4' | 'letter' | 'legal';
  margin: 'none' | 'small';
}

export default function ImageToPDF() {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<PDFSettings>({
    orientation: 'portrait',
    pageSize: 'a4',
    margin: 'none'
  });
  const [pdfResult, setPdfResult] = useState<Uint8Array | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      // Clean up object URLs to prevent memory leaks
      previewUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  const processFiles = (selectedFiles: File[]) => {
    try {
      setFiles(prev => [...prev, ...selectedFiles]);
      
      // Create preview URLs using URL.createObjectURL
      const urls = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...urls]);
      
      if (step === 1) {
        setStep(2);
      }
    } catch (error) {
      console.error('Error creating preview URLs:', error);
      toast.error(t('common.error'));
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    
    const selectedFiles = Array.from(event.target.files);
    processFiles(selectedFiles);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const droppedFiles = Array.from(event.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (droppedFiles.length === 0) {
      toast.error('Please drop image files only');
      return;
    }
    
    processFiles(droppedFiles);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleConvert = async () => {
    try {
      setIsProcessing(true);
      const result = await imagesToPDF(files, settings);
      setPdfResult(result);
      setStep(3);
      toast.success(t('common.complete'));
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error(t('common.error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (pdfResult) {
      downloadPDF(pdfResult, 'converted.pdf');
    }
  };

  const resetAll = () => {
    // Clean up existing object URLs
    previewUrls.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    
    setStep(1);
    setFiles([]);
    setPreviewUrls([]);
    setPdfResult(null);
    setSettings({
      orientation: 'portrait',
      pageSize: 'a4',
      margin: 'none'
    });
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= files.length) return;

    setFiles(prev => {
      const newFiles = [...prev];
      const [movedFile] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, movedFile);
      return newFiles;
    });

    setPreviewUrls(prev => {
      const newPreviews = [...prev];
      const [movedPreview] = newPreviews.splice(fromIndex, 1);
      newPreviews.splice(toIndex, 0, movedPreview);
      return newPreviews;
    });
  };

  const removeImage = (index: number) => {
    // Clean up the URL for the removed file
    if (previewUrls[index] && previewUrls[index].startsWith('blob:')) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddMoreImages = () => {
    if (addMoreInputRef.current) {
      addMoreInputRef.current.value = '';
      addMoreInputRef.current.click();
    }
  };

  const handleSelectImages = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold mb-4">{t('tools.imageToPDF.title')}</h1>
              <p className="text-gray-600 mb-8">{t('tools.imageToPDF.description')}</p>
              
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer bg-white shadow-sm"
                onClick={handleSelectImages}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="mt-4 text-lg font-medium text-gray-700">
                  {t('upload.dragDrop')}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {t('upload.or')}
                </p>
                <Button 
                  type="button" 
                  className="mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectImages();
                  }}
                >
                  {t('upload.selectImages')}
                </Button>
                <p className="mt-4 text-xs text-gray-400">
                  Supports JPG, PNG, HEIC formats
                </p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              <div className="lg:col-span-3">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Move className="w-5 h-5 mr-2 text-blue-600" />
                    Arrange Images ({files.length})
                  </h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                    {files.map((file, index) => (
                      <motion.div 
                        key={`${file.name}-${index}-${file.lastModified}`}
                        layout
                        className="relative group bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="aspect-square relative">
                          <img
                            src={previewUrls[index]}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Image load error:', e);
                              // Recreate the URL if it's broken
                              const newUrl = URL.createObjectURL(file);
                              setPreviewUrls(prev => {
                                const newUrls = [...prev];
                                if (newUrls[index] && newUrls[index].startsWith('blob:')) {
                                  URL.revokeObjectURL(newUrls[index]);
                                }
                                newUrls[index] = newUrl;
                                return newUrls;
                              });
                            }}
                          />
                          
                          {/* Order indicator */}
                          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {index + 1}
                          </div>

                          {/* Controls overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="flex gap-1">
                              <Button
                                onClick={() => moveImage(index, index - 1)}
                                disabled={index === 0}
                                size="sm"
                                variant="secondary"
                                className="p-1 h-8 w-8"
                                title="Move left"
                              >
                                <ArrowLeft className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => moveImage(index, index + 1)}
                                disabled={index === files.length - 1}
                                size="sm"
                                variant="secondary"
                                className="p-1 h-8 w-8"
                                title="Move right"
                              >
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => removeImage(index)}
                                size="sm"
                                className="p-1 h-8 w-8 bg-red-600 hover:bg-red-700"
                                title="Remove"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-2">
                          <p className="text-xs text-gray-600 truncate font-medium">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {(file.size / (1024 * 1024)).toFixed(1)} MB
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <input
                    ref={addMoreInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <button
                    onClick={handleAddMoreImages}
                    className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all cursor-pointer"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add more images
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm h-fit">
                <h3 className="text-lg font-semibold mb-4">PDF Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page orientation
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {['portrait', 'landscape'].map((orientation) => (
                        <button
                          key={orientation}
                          onClick={() => setSettings(s => ({ ...s, orientation: orientation as 'portrait' | 'landscape' }))}
                          className={`p-3 text-center rounded-lg border transition-all ${
                            settings.orientation === orientation
                              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                              : 'border-gray-200 hover:bg-gray-50 hover:border-blue-200'
                          }`}
                        >
                          {orientation.charAt(0).toUpperCase() + orientation.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page size
                    </label>
                    <select
                      value={settings.pageSize}
                      onChange={(e) => setSettings(s => ({ ...s, pageSize: e.target.value as 'a4' | 'letter' | 'legal' }))}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    >
                      <option value="a4">A4 (297×210 mm)</option>
                      <option value="letter">Letter (8.5×11 in)</option>
                      <option value="legal">Legal (8.5×14 in)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Margin
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { key: 'none', label: 'No margin' },
                        { key: 'small', label: 'Small (12mm)' }
                      ].map((margin) => (
                        <button
                          key={margin.key}
                          onClick={() => setSettings(s => ({ ...s, margin: margin.key as 'none' | 'small' }))}
                          className={`p-3 text-center rounded-lg border transition-all ${
                            settings.margin === margin.key
                              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                              : 'border-gray-200 hover:bg-gray-50 hover:border-blue-200'
                          }`}
                        >
                          {margin.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleConvert}
                  className="w-full mt-6"
                  disabled={isProcessing || files.length === 0}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Converting...
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
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900">
                PDF Created Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Your {files.length} images have been converted to PDF
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleDownload}
                  className="px-8 py-3"
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
                  Convert More Images
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}