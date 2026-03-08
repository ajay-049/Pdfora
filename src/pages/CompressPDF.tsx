import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import ProcessingOverlay from '../components/ProcessingOverlay';
import { compressPDF, downloadPDF } from '../utils/pdf';
import { toast } from 'react-hot-toast';

interface CompressionSettings {
  quality: 'low' | 'medium' | 'high';
  targetSize?: number;
  removeMetadata: boolean;
  optimizeImages: boolean;
}

export default function CompressPDF() {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [settings, setSettings] = useState<CompressionSettings>({
    quality: 'medium',
    targetSize: 1, // 1MB default target size
    removeMetadata: true,
    optimizeImages: true
  });

  const handleFileSelect = async (files: File[]) => {
    if (!files || files.length === 0) {
      toast.error('Please select a PDF file');
      return;
    }

    const file = files[0];
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Please select a valid PDF file');
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(20);

      const originalSize = file.size / (1024 * 1024); // Convert to MB
      
      setProgress(40);
      
      // Compress the PDF
      const result = await compressPDF(file, settings.quality);
      
      setProgress(80);
      
      // Check if we need to try different compression based on target size
      if (settings.targetSize && result) {
        const targetBytes = settings.targetSize * 1024 * 1024; // Convert MB to bytes
        const currentSize = result.length;
        
        // If file is still too large and we're not at maximum compression, try again
        if (currentSize > targetBytes && settings.quality !== 'low') {
          const maxCompressionResult = await compressPDF(file, 'low');
          if (maxCompressionResult && maxCompressionResult.length < currentSize) {
            setProgress(100);
            const finalSize = maxCompressionResult.length / (1024 * 1024);
            const compressionRatio = ((originalSize - finalSize) / originalSize * 100).toFixed(1);
            
            downloadPDF(maxCompressionResult, `compressed_${file.name}`);
            toast.success(`PDF compressed successfully! Reduced by ${compressionRatio}% (${finalSize.toFixed(2)}MB)`);
            return;
          }
        }
      }

      setProgress(100);
      
      if (result) {
        const finalSize = result.length / (1024 * 1024); // Convert to MB
        const compressionRatio = ((originalSize - finalSize) / originalSize * 100).toFixed(1);
        
        downloadPDF(result, `compressed_${file.name}`);
        toast.success(`PDF compressed successfully! Reduced by ${compressionRatio}% (${finalSize.toFixed(2)}MB)`);
      } else {
        throw new Error('Compression failed');
      }
    } catch (error) {
      console.error('Error compressing PDF:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to compress PDF. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const qualityOptions = [
    {
      key: 'high',
      title: t('compression.highQuality'),
      description: t('compression.highQualityDesc'),
      icon: '🔥',
      reduction: t('compression.highQualityReduction'),
      useCase: t('compression.highQualityUse')
    },
    {
      key: 'medium',
      title: t('compression.balanced'),
      description: t('compression.balancedDesc'),
      icon: '⚖️',
      reduction: t('compression.balancedReduction'),
      useCase: t('compression.balancedUse')
    },
    {
      key: 'low',
      title: t('compression.maxCompression'),
      description: t('compression.maxCompressionDesc'),
      icon: '🗜️',
      reduction: t('compression.maxCompressionReduction'),
      useCase: t('compression.maxCompressionUse')
    }
  ];

  const targetSizeOptions = [
    { value: 0.5, label: '500 KB', description: t('compression.ultraCompact') },
    { value: 1, label: '1 MB', description: t('compression.perfectForPan') },
    { value: 2, label: '2 MB', description: t('compression.goodForApps') },
    { value: 5, label: '5 MB', description: t('compression.highQualityDocs') }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Compress PDF</h1>
          <p className="text-gray-600">Reduce PDF file size while maintaining quality.</p>
        </div>

        <ProcessingOverlay visible={isProcessing} progress={progress} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <FileUpload
              onFileSelect={handleFileSelect}
              accept={{ 'application/pdf': ['.pdf'] }}
              multiple={false}
              tool="compress"
            />
          </div>

          {/* Settings Panel */}
          <div className="bg-white rounded-xl shadow-sm p-6 h-fit">
            <div className="flex items-center mb-4">
              <Settings className="w-5 h-5 text-gray-700 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
            </div>
            
            <div className="space-y-4">
              {/* Quality Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                  Compression Quality
                </label>
                <div className="space-y-2">
                  {qualityOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setSettings(s => ({ ...s, quality: option.key as 'low' | 'medium' | 'high' }))}
                      className={`w-full p-2 text-left text-xs rounded-lg border transition-all ${
                        settings.quality === option.key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{option.title}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Target Size */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                  Target Size
                </label>
                <div className="space-y-1">
                  {targetSizeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSettings(s => ({ ...s, targetSize: option.value }))}
                      className={`w-full p-2 text-center text-xs rounded-lg border transition-all ${
                        settings.targetSize === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Options */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                  Options
                </label>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.removeMetadata}
                      onChange={(e) => setSettings(s => ({ ...s, removeMetadata: e.target.checked }))}
                      className="rounded w-3 h-3"
                    />
                    <span className="ml-2 text-gray-700">Remove metadata</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.optimizeImages}
                      onChange={(e) => setSettings(s => ({ ...s, optimizeImages: e.target.checked }))}
                      className="rounded w-3 h-3"
                    />
                    <span className="ml-2 text-gray-700">Optimize images</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}