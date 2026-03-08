import { Share2 } from 'lucide-react';
import Button from './ui/Button';

interface ShareButtonProps {
  fileUrl: string;
  fileName: string;
}

export default function ShareButton({ fileUrl, fileName }: ShareButtonProps) {
  const shareToWhatsApp = () => {
    const text = `Check out my converted file: ${fileName}`;
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(text + ' ' + fileUrl)}`;
    window.location.href = whatsappUrl;
  };

  return (
    <Button
      onClick={shareToWhatsApp}
      className="flex items-center space-x-2"
      variant="secondary"
    >
      <Share2 className="h-4 w-4" />
      <span>Share via WhatsApp</span>
    </Button>
  );
}