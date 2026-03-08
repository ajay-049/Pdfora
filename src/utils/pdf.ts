import { PDFDocument } from 'pdf-lib';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

interface ImageToPDFSettings {
  margin: 'none' | 'small';
  orientation: 'portrait' | 'landscape';
  pageSize: 'a4' | 'letter' | 'legal';
}

interface SplitRange {
  id: string;
  name: string;
  startPage: number;
  endPage: number;
}

interface ConvertedImage {
  id: string;
  pageNumber: number;
  dataUrl: string;
  filename: string;
}

interface ConversionSettings {
  quality: 'low' | 'medium' | 'high';
  format: 'jpg' | 'png';
  scale: number;
  preserveTransparency?: boolean;
}

export async function mergePDFs(pdfFiles: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of pdfFiles) {
    const fileBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(fileBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return mergedPdf.save();
}

export async function splitPDF(pdfFile: File, ranges: SplitRange[]): Promise<{ name: string; data: Uint8Array }[]> {
  try {
    const fileBuffer = await pdfFile.arrayBuffer();
    const sourcePdf = await PDFDocument.load(fileBuffer);
    const results: { name: string; data: Uint8Array }[] = [];

    for (const range of ranges) {
      const newPdf = await PDFDocument.create();
      
      // Validate range
      const startPage = Math.max(1, range.startPage);
      const endPage = Math.min(sourcePdf.getPageCount(), range.endPage);
      
      if (startPage > endPage) {
        throw new Error(`Invalid range: ${range.name}`);
      }

      // Copy pages in the specified range
      const pageIndices = [];
      for (let i = startPage - 1; i < endPage; i++) {
        pageIndices.push(i);
      }

      const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      // Save the new PDF
      const pdfBytes = await newPdf.save();
      results.push({
        name: range.name,
        data: pdfBytes
      });
    }

    return results;
  } catch (error) {
    console.error('PDF split error:', error);
    throw new Error('Failed to split PDF. The file might be corrupted or password-protected.');
  }
}

export async function createPDFFromPages(pdfFile: File, pageNumbers: number[]): Promise<Uint8Array> {
  try {
    const fileBuffer = await pdfFile.arrayBuffer();
    const sourcePdf = await PDFDocument.load(fileBuffer);
    const newPdf = await PDFDocument.create();
    
    // Convert page numbers to indices (1-based to 0-based)
    const pageIndices = pageNumbers.map(pageNum => pageNum - 1);
    
    // Validate page indices
    const maxPageIndex = sourcePdf.getPageCount() - 1;
    const validIndices = pageIndices.filter(index => index >= 0 && index <= maxPageIndex);
    
    if (validIndices.length === 0) {
      throw new Error('No valid pages selected');
    }

    // Copy pages in the specified order
    const copiedPages = await newPdf.copyPages(sourcePdf, validIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    // Save the new PDF
    return await newPdf.save();
  } catch (error) {
    console.error('PDF creation error:', error);
    throw new Error('Failed to create PDF from selected pages. The file might be corrupted or password-protected.');
  }
}

export async function convertPDFToImages(pdfFile: File, settings: ConversionSettings): Promise<ConvertedImage[]> {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    
    // Load PDF.js
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const pageCount = pdf.numPages;
    const convertedImages: ConvertedImage[] = [];

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: settings.scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          // Set background for JPG format (PNG preserves transparency)
          if (settings.format === 'jpg') {
            context.fillStyle = '#FFFFFF';
            context.fillRect(0, 0, canvas.width, canvas.height);
          }

          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;

          // Convert to desired format
          const quality = settings.quality === 'high' ? 0.95 : settings.quality === 'medium' ? 0.8 : 0.6;
          const mimeType = settings.format === 'jpg' ? 'image/jpeg' : 'image/png';
          const dataUrl = canvas.toDataURL(mimeType, quality);
          
          const filename = `page-${pageNum.toString().padStart(3, '0')}.${settings.format}`;
          
          convertedImages.push({
            id: `page-${pageNum}`,
            pageNumber: pageNum,
            dataUrl,
            filename
          });
        }
      } catch (error) {
        console.error(`Error converting page ${pageNum}:`, error);
        throw new Error(`Failed to convert page ${pageNum}`);
      }
    }

    return convertedImages;
  } catch (error) {
    console.error('PDF to image conversion error:', error);
    throw new Error('Failed to convert PDF to images. The file might be corrupted or password-protected.');
  }
}

export async function downloadZip(images: ConvertedImage[], filename: string): Promise<void> {
  try {
    const zip = new JSZip();
    
    // Add each image to the ZIP
    for (const image of images) {
      // Convert data URL to blob
      const response = await fetch(image.dataUrl);
      const blob = await response.blob();
      zip.file(image.filename, blob);
    }
    
    // Generate ZIP file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Download the ZIP file
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error creating ZIP file:', error);
    throw new Error('Failed to create ZIP file');
  }
}

export async function compressPDF(pdfFile: File, quality: 'low' | 'medium' | 'high'): Promise<Uint8Array> {
  try {
    const fileBuffer = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileBuffer);
    
    // Remove metadata to reduce file size
    try {
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('PDFora');
      pdfDoc.setCreator('PDFora');
      pdfDoc.setCreationDate(new Date());
      pdfDoc.setModificationDate(new Date());
    } catch (error) {
      console.warn('Could not modify metadata:', error);
    }

    // Get compression settings based on quality level
    let saveOptions: any = {
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50
    };

    // Adjust compression based on quality
    switch (quality) {
      case 'low':
        // Maximum compression
        saveOptions = {
          ...saveOptions,
          useObjectStreams: true,
          addDefaultPage: false,
          objectsPerTick: 200,
          updateFieldAppearances: false
        };
        break;
      case 'medium':
        // Balanced compression
        saveOptions = {
          ...saveOptions,
          useObjectStreams: true,
          addDefaultPage: false,
          objectsPerTick: 100
        };
        break;
      case 'high':
        // Minimal compression, preserve quality
        saveOptions = {
          ...saveOptions,
          useObjectStreams: false,
          addDefaultPage: false,
          objectsPerTick: 50
        };
        break;
    }

    // For maximum compression, try to optimize images and remove unused objects
    if (quality === 'low') {
      try {
        // Get all pages and try to optimize them
        const pages = pdfDoc.getPages();
        
        // This is a basic optimization approach
        // In practice, you might need more sophisticated image compression
        for (const page of pages) {
          try {
            // Get page resources
            const pageNode = page.node;
            
            // Try to optimize page contents if possible
            if (pageNode.Contents && typeof pageNode.Contents === 'object') {
              // Basic content stream optimization could go here
              // This is a placeholder for more advanced compression techniques
            }
          } catch (error) {
            // Could not optimize page
          }
        }
      } catch (error) {
        // Could not optimize document structure
      }
    }

    // Save the PDF with compression settings
    const compressedBytes = await pdfDoc.save(saveOptions);

    // Verify the compression worked
    const originalSize = fileBuffer.byteLength;
    const compressedSize = compressedBytes.byteLength;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

    // If compression didn't work well, try alternative approach
    if (compressionRatio < 5 && quality === 'low') {
      // Alternative: Create a new PDF and copy content with more aggressive settings
      const newPdf = await PDFDocument.create();
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [pdfDoc.getPageIndices()[pages.indexOf(page)]]);
        newPdf.addPage(copiedPage);
      }

      // Save with maximum compression
      const alternativeBytes = await newPdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 500,
        updateFieldAppearances: false
      });

      const alternativeSize = alternativeBytes.byteLength;

      // Use the better result
      if (alternativeSize < compressedSize) {
        return alternativeBytes;
      }
    }

    return compressedBytes;
  } catch (error) {
    console.error('PDF compression error:', error);
    throw new Error('Failed to compress PDF. The file might be corrupted, password-protected, or use unsupported features.');
  }
}

export async function imagesToPDF(imageFiles: File[], settings: ImageToPDFSettings = {
  margin: 'none',
  orientation: 'portrait',
  pageSize: 'a4'
}): Promise<Uint8Array> {
  const pdf = new jsPDF({
    orientation: settings.orientation,
    unit: 'mm',
    format: settings.pageSize
  });

  const margin = settings.margin === 'small' ? 12.7 : 0; // 12.7mm = 0.5 inch
  const pageWidth = pdf.internal.pageSize.getWidth() - (margin * 2);
  const pageHeight = pdf.internal.pageSize.getHeight() - (margin * 2);

  for (let i = 0; i < imageFiles.length; i++) {
    if (i > 0) pdf.addPage();

    const file = imageFiles[i];
    let imageData = await file.arrayBuffer();

    // Create image and wait for it to load
    const img = new Image();
    const imageUrl = URL.createObjectURL(new Blob([imageData]));
    
    await new Promise<void>((resolve) => {
      img.onload = () => {
        // Calculate dimensions to maintain aspect ratio
        const imgRatio = img.width / img.height;
        
        let finalWidth = pageWidth;
        let finalHeight = pageWidth / imgRatio;
        
        if (finalHeight > pageHeight) {
          finalHeight = pageHeight;
          finalWidth = pageHeight * imgRatio;
        }
        
        // Center the image on the page
        const x = margin + (pageWidth - finalWidth) / 2;
        const y = margin + (pageHeight - finalHeight) / 2;
        
        pdf.addImage(img, 'JPEG', x, y, finalWidth, finalHeight);
        URL.revokeObjectURL(imageUrl);
        resolve();
      };
      img.src = imageUrl;
    });
  }

  return new Uint8Array(pdf.output('arraybuffer') as ArrayBuffer);
}

export function downloadPDF(pdfBytes: Uint8Array, filename: string) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}