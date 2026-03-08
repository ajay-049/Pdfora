const UPLOAD_PREFIX = 'upload_';
const EXPIRY_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

interface StoredFile {
  id: string;
  url: string;
  timestamp: number;
  name: string;
  size: number;
}

export const uploadToServer = async (file: File): Promise<StoredFile> => {
  return new Promise((resolve, reject) => {
    const fileId = crypto.randomUUID();
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const fileData: StoredFile = {
          id: fileId,
          url: reader.result as string,
          timestamp: Date.now(),
          name: file.name,
          size: file.size
        };

        // Store file data in localStorage
        localStorage.setItem(`${UPLOAD_PREFIX}${fileId}`, JSON.stringify(fileData));
        resolve(fileData);
      } catch (error) {
        reject(new Error('Failed to process file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    // Read file as data URL
    reader.readAsDataURL(file);
  });
};

export const getStoredFile = (fileId: string): StoredFile | null => {
  const item = localStorage.getItem(`${UPLOAD_PREFIX}${fileId}`);
  if (!item) return null;

  const fileData: StoredFile = JSON.parse(item);
  
  // Check if file has expired
  if (Date.now() - fileData.timestamp > EXPIRY_TIME) {
    deleteFile(fileId);
    return null;
  }

  return fileData;
};

export const deleteFile = (fileId: string): void => {
  localStorage.removeItem(`${UPLOAD_PREFIX}${fileId}`);
};

export const clearExpiredFiles = (): void => {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(UPLOAD_PREFIX)) {
      const item = localStorage.getItem(key);
      if (item) {
        const fileData: StoredFile = JSON.parse(item);
        if (Date.now() - fileData.timestamp > EXPIRY_TIME) {
          deleteFile(fileData.id);
        }
      }
    }
  });
};

export const clearUploads = (): void => {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(UPLOAD_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
};

// Run cleanup every hour
setInterval(clearExpiredFiles, EXPIRY_TIME);