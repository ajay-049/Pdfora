import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Trash2, ArrowUp, ArrowDown, Plus, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

interface FileUploadProps {
  onFileSelect: (files: File[], settings?: any) => void;
  accept: Record<string, string[]>;
  maxFiles?: number;
  multiple?: boolean;
  tool?: 'merge' | 'imageTopdf' | 'compress';
}

const MAX_FILES = 10;
const MAX_TOTAL_SIZE = 25 * 1024 * 1024; // 25MB in bytes

export default function FileUpload({ onFileSelect, accept, multiple = false, tool }: FileUploadProps) {
  const { t } = useTranslation();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [pdfPreviews, setPdfPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (newFiles: File[]): boolean => {
    const totalFiles = selectedFiles.length + newFiles.length;
    if (totalFiles > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} files allowed`);
      return false;
    }

    const currentTotalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);
    const newTotalSize = newFiles.reduce((acc, file) => acc + file.size, 0);
    
    if (currentTotalSize + newTotalSize > MAX_TOTAL_SIZE) {
      toast.error('Total file size cannot exceed 25MB');
      return false;
    }

    return true;
  };

  const generatePDFPreview = async (file: File): Promise<string> => {
    try {
      // For PDF files, we'll create a simple preview using PDF-lib or canvas
      await file.arrayBuffer();
      
      // Create a simple PDF icon preview for now
      // In a real implementation, you might want to use PDF.js to render the first page
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 250;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Draw a simple PDF preview
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, 200, 250);
        ctx.fillStyle = '#374151';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PDF', 100, 125);
        ctx.font = '12px Arial';
        ctx.fillText(file.name, 100, 150);
        ctx.fillText(`${(file.size / (1024 * 1024)).toFixed(1)} MB`, 100, 170);
      }
      
      return canvas.toDataURL();
    } catch (error) {
      console.error('Error generating PDF preview:', error);
      return '';
    }
  };

  const processFiles = async (files: File[]) => {
    if (!validateFiles(files)) return;

    setSelectedFiles(prev => [...prev, ...files]);
    
    // Generate previews
    const newPreviews: string[] = [];
    const newPdfPreviews: string[] = [];
    
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        newPreviews.push(URL.createObjectURL(file));
        newPdfPreviews.push('');
      } else if (file.type === 'application/pdf') {
        newPreviews.push('');
        const pdfPreview = await generatePDFPreview(file);
        newPdfPreviews.push(pdfPreview);
      } else {
        newPreviews.push('');
        newPdfPreviews.push('');
      }
    }
    
    setPreviewUrls(prev => [...prev, ...newPreviews]);
    setPdfPreviews(prev => [...prev, ...newPdfPreviews]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    processFiles(files);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    processFiles(acceptedFiles);
  }, []);

  const handleAddMoreClick = () => {
    if (addMoreInputRef.current) {
      addMoreInputRef.current.value = '';
      addMoreInputRef.current.click();
    }
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  React.useEffect(() => {
    return () => {
      previewUrls.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  const removeFile = (index: number) => {
    // Clean up the URL for the removed file
    if (previewUrls[index] && previewUrls[index].startsWith('blob:')) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setPdfPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === selectedFiles.length - 1)) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    setSelectedFiles(prev => {
      const files = [...prev];
      [files[index], files[newIndex]] = [files[newIndex], files[index]];
      return files;
    });

    setPreviewUrls(prev => {
      const urls = [...prev];
      [urls[index], urls[newIndex]] = [urls[newIndex], urls[index]];
      return urls;
    });

    setPdfPreviews(prev => {
      const previews = [...prev];
      [previews[index], previews[newIndex]] = [previews[newIndex], previews[index]];
      return previews;
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    noClick: true // Disable click on dropzone to handle it manually
  });

  const handleConvert = () => {
    onFileSelect(selectedFiles);
  };

  const renderFilePreview = (file: File, index: number) => {
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    return (
      <motion.div
        key={`${file.name}-${index}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all group"
      >
        <div className="relative w-full h-[140px]">
          {isImage && previewUrls[index] ? (
            <img
              src={previewUrls[index]}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          ) : isPDF && pdfPreviews[index] ? (
            <img
              src={pdfPreviews[index]}
              alt={`PDF Preview: ${file.name}`}
              className="w-full h-full object-contain bg-gray-50"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
              <FileText className="h-12 w-12 text-gray-400 mb-2" />
              <span className="text-xs text-gray-500 text-center px-2">
                {isPDF ? 'PDF Document' : 'File'}
              </span>
            </div>
          )}
          
          {/* File type indicator */}
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 text-xs font-medium rounded ${
              isImage ? 'bg-green-100 text-green-800' : 
              isPDF ? 'bg-red-100 text-red-800' : 
              'bg-gray-100 text-gray-800'
            }`}>
              {isImage ? 'IMG' : isPDF ? 'PDF' : 'FILE'}
            </span>
          </div>
        </div>
        
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <div className="flex items-center space-x-1 ml-2">
              {selectedFiles.length > 1 && (
                <>
                  <button
                    onClick={() => moveFile(index, 'up')}
                    disabled={index === 0}
                    className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50 transition-colors"
                    title={t('actions.moveUp')}
                  >
                    <ArrowUp className="h-4 w-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => moveFile(index, 'down')}
                    disabled={index === selectedFiles.length - 1}
                    className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50 transition-colors"
                    title={t('actions.moveDown')}
                  >
                    <ArrowDown className="h-4 w-4 text-gray-500" />
                  </button>
                </>
              )}
              <button
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-red-50 rounded-full transition-colors"
                title={t('actions.remove')}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {selectedFiles.length === 0 && (
        <div
          {...getRootProps()}
          className={`min-h-[240px] flex items-center justify-center border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
          onClick={handleSelectClick}
        >
          <input 
            {...getInputProps()} 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <div className="text-center">
            <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-xl font-medium text-gray-700 mb-2">
              {isDragActive ? t('upload.dropping') : t('upload.dragDrop')}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {t('upload.or')}
            </p>
            <Button 
              type="button" 
              className="px-6 py-3"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectClick(e);
              }}
            >
              {tool === 'imageTopdf' ? t('upload.selectImages') : t('upload.selectPDF')}
            </Button>
            <p className="mt-4 text-sm text-gray-500">
              Maximum {MAX_FILES} files, total size up to 25MB
            </p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Selected Files ({selectedFiles.length})
              </h3>
              <div className="text-sm text-gray-500">
                Total: {(selectedFiles.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024)).toFixed(1)} MB
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {selectedFiles.map((file, index) => renderFilePreview(file, index))}
            </div>

            {selectedFiles.length < MAX_FILES && (
              <div className="flex justify-center mb-6">
                <input
                  ref={addMoreInputRef}
                  type="file"
                  accept={Object.keys(accept).join(',')}
                  multiple={multiple}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  onClick={handleAddMoreClick}
                  variant="secondary"
                  className="px-6 py-3 flex items-center gap-2 border-2 border-dashed hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add More {tool === 'imageTopdf' ? 'Images' : 'PDFs'}
                </Button>
              </div>
            )}

            <div className="flex justify-center">
              <Button
                onClick={handleConvert}
                className="px-8 py-3 text-lg w-full sm:w-auto"
                disabled={selectedFiles.length === 0}
              >
                {tool === 'imageTopdf' ? t('actions.convertToPDF') : 
                 tool === 'merge' ? t('actions.mergePDF') : 
                 'Compress PDF'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}