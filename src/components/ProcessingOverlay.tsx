import { Loader2 } from 'lucide-react';

interface ProcessingOverlayProps {
  visible: boolean;
  progress?: number;
}

export default function ProcessingOverlay({ visible, progress }: ProcessingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-sm w-full mx-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
        <h3 className="text-xl font-semibold mt-4">Processing...</h3>
        {progress !== undefined && (
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">{progress}% complete</p>
          </div>
        )}
      </div>
    </div>
  );
}