import React, { useState, useRef } from 'react';
import { Scissors, Download, RefreshCw, FileText, Trash2, ArrowLeft, ArrowRight, Move, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { createPDFFromPages, downloadPDF } from '../utils/pdf';
import Button from '../components/ui/Button';
import ProcessingOverlay from '../components/ProcessingOverlay';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

interface PageInfo {
  id: string;
  pageNumber: number;
  previewUrl: string;
  selected: boolean;
}

export default function SplitPDF() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);
  const [pdfResult, setPdfResult] = useState<Uint8Array | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    try {
      setFile(selectedFile);
      setIsLoadingPreviews(true);
      
      // Load PDF and generate page previews
      const arrayBuffer = await selectedFile.arrayBuffer();
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      
      // Generate page previews using PDF.js
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
      
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const pageInfos: PageInfo[] = [];

      for (let i = 1; i <= pageCount; i++) {
        try {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.5 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          if (context) {
            await page.render({
              canvasContext: context,
              viewport: viewport
            }).promise;

            const previewUrl = canvas.toDataURL();
            pageInfos.push({
              id: `page-${i}`,
              pageNumber: i,
              previewUrl,
              selected: true
            });
          }
        } catch (error) {
          console.error(`Error generating preview for page ${i}:`, error);
          // Create a placeholder preview
          pageInfos.push({
            id: `page-${i}`,
            pageNumber: i,
            previewUrl: '',
            selected: true
          });
        }
      }
      
      setPages(pageInfos);
      setStep(2);
      toast.success(`PDF loaded with ${pageCount} pages`);
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error('Failed to load PDF file. Please try again.');
    } finally {
      setIsLoadingPreviews(false);
    }
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

  const togglePageSelection = (pageId: string) => {
    setPages(prev => prev.map(page => 
      page.id === pageId ? { ...page, selected: !page.selected } : page
    ));
  };

  const deletePage = (pageId: string) => {
    setPages(prev => prev.filter(page => page.id !== pageId));
    toast.success('Page removed');
  };

  const movePage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pages.length) return;

    setPages(prev => {
      const newPages = [...prev];
      const [movedPage] = newPages.splice(fromIndex, 1);
      newPages.splice(toIndex, 0, movedPage);
      return newPages;
    });
  };

  const selectAllPages = () => {
    setPages(prev => prev.map(page => ({ ...page, selected: true })));
  };

  const deselectAllPages = () => {
    setPages(prev => prev.map(page => ({ ...page, selected: false })));
  };

  const handleCreatePDF = async () => {
    const selectedPages = pages.filter(page => page.selected);
    
    if (selectedPages.length === 0) {
      toast.error('Please select at least one page');
      return;
    }

    if (!file) {
      toast.error('No file selected');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Create new PDF with selected pages in the current order
      const pageNumbers = selectedPages.map(page => page.pageNumber);
      const result = await createPDFFromPages(file, pageNumbers);
      
      setPdfResult(result);
      setStep(3);
      toast.success(`PDF created with ${selectedPages.length} pages`);
    } catch (error) {
      console.error('Error creating PDF:', error);
      toast.error('Failed to create PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (pdfResult) {
      const selectedCount = pages.filter(page => page.selected).length;
      downloadPDF(pdfResult, `split-pdf-${selectedCount}-pages.pdf`);
    }
  };

  const resetAll = () => {
    setStep(1);
    setFile(null);
    setPages([]);
    setPdfResult(null);
  };

  const handleSelectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const selectedCount = pages.filter(page => page.selected).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <ProcessingOverlay visible={isProcessing || isLoadingPreviews} />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold mb-4 text-gray-900">Split PDF</h1>
              <p className="text-gray-600 mb-8">Upload your PDF, preview pages, and extract the ones you need.</p>
              
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
              className="space-y-6"
            >
              {/* File Info & Controls */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                  <div className="flex items-center mb-4 sm:mb-0">
                    <FileText className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{file?.name}</h3>
                      <p className="text-sm text-gray-500">
                        {pages.length} pages • {selectedCount} selected • {((file?.size || 0) / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={selectAllPages}
                      variant="secondary"
                      size="sm"
                    >
                      Select All
                    </Button>
                    <Button
                      onClick={deselectAllPages}
                      variant="secondary"
                      size="sm"
                    >
                      Deselect All
                    </Button>
                    <Button
                      onClick={() => setStep(1)}
                      variant="secondary"
                      size="sm"
                    >
                      Change File
                    </Button>
                  </div>
                </div>

                {/* Page Management Grid */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Move className="w-5 h-5 mr-2 text-blue-600" />
                    Manage Pages ({pages.length} total, {selectedCount} selected)
                  </h4>
                  
                  {pages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Scissors className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Loading page previews...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {pages.map((page, index) => (
                        <motion.div
                          key={page.id}
                          layout
                          className={`relative group bg-white rounded-lg border-2 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${
                            page.selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                          }`}
                        >
                          {/* Page Preview */}
                          <div className="aspect-[3/4] relative">
                            {page.previewUrl ? (
                              <img
                                src={page.previewUrl}
                                alt={`Page ${page.pageNumber}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <FileText className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                            
                            {/* Selection Overlay */}
                            <div 
                              className={`absolute inset-0 transition-opacity cursor-pointer ${
                                page.selected ? 'bg-blue-500/20' : 'bg-black/0 hover:bg-black/10'
                              }`}
                              onClick={() => togglePageSelection(page.id)}
                            >
                              {page.selected && (
                                <div className="absolute top-2 left-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">✓</span>
                                </div>
                              )}
                            </div>

                            {/* Page Number */}
                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {page.pageNumber}
                            </div>

                            {/* Controls Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => movePage(index, index - 1)}
                                  disabled={index === 0}
                                  size="sm"
                                  variant="secondary"
                                  className="p-1 h-8 w-8"
                                  title="Move left"
                                >
                                  <ArrowLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => movePage(index, index + 1)}
                                  disabled={index === pages.length - 1}
                                  size="sm"
                                  variant="secondary"
                                  className="p-1 h-8 w-8"
                                  title="Move right"
                                >
                                  <ArrowRight className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => deletePage(page.id)}
                                  size="sm"
                                  className="p-1 h-8 w-8 bg-red-600 hover:bg-red-700"
                                  title="Delete page"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Page Info */}
                          <div className="p-2 text-center">
                            <p className="text-xs font-medium text-gray-700">
                              Page {page.pageNumber}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleCreatePDF}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700"
                    disabled={selectedCount === 0 || pages.length === 0}
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Create PDF ({selectedCount} pages)
                  </Button>
                </div>

                {/* Instructions */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-semibold text-blue-900 mb-2">How to use:</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Click on pages to select/deselect them</li>
                    <li>• Hover over pages to see move and delete controls</li>
                    <li>• Use arrow buttons to reorder pages</li>
                    <li>• Delete unwanted pages with the trash button</li>
                    <li>• Click "Create PDF" when you're satisfied with your selection</li>
                  </ul>
                </div>
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
                PDF Created Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Your custom PDF has been created with {pages.filter(page => page.selected).length} pages
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
                  Create Another PDF
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEO Content */}
        <div className="mt-16 bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6">Advanced PDF Page Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Page Previews</h3>
              <p className="text-gray-600 text-sm">See visual previews of all PDF pages before editing</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Delete Pages</h3>
              <p className="text-gray-600 text-sm">Remove unwanted pages with a single click</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Move className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Reorder Pages</h3>
              <p className="text-gray-600 text-sm">Drag and rearrange pages in any order you want</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Custom Output</h3>
              <p className="text-gray-600 text-sm">Generate a new PDF with your selected and arranged pages</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}