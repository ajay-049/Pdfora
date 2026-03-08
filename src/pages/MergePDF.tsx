import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FileUpload from '../components/FileUpload';
import ProcessingOverlay from '../components/ProcessingOverlay';
import { mergePDFs, downloadPDF } from '../utils/pdf';
import { toast } from 'react-hot-toast';

export default function MergePDF() {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  const handleFileSelect = async (files: File[]) => {
    try {
      setIsProcessing(true);
      setProgress(20);
      const result = await mergePDFs(files);
      setProgress(100);
      
      if (result) {
        downloadPDF(result, 'merged.pdf');
        toast.success(t('common.complete'));
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error(t('common.error'));
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <ProcessingOverlay visible={isProcessing} progress={progress} />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Merge PDF</h1>
          <p className="text-gray-600">Combine multiple PDF files into one document.</p>
        </div>
        <FileUpload
          onFileSelect={handleFileSelect}
          accept={{ 'application/pdf': ['.pdf'] }}
          multiple={true}
          tool="merge"
        />
      </div>
    </div>
  );
}