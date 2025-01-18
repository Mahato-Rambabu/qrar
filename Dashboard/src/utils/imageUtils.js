// Helper to create an image object from a URL
export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous'; // Allow cross-origin images if needed
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(new Error('Failed to load image'));
    image.src = url;
  });

// Helper function to crop an image
export const getCroppedImg = async (imageSrc, crop) => {
  if (!crop || !crop.width || !crop.height) {
    throw new Error('Invalid crop dimensions: Crop data is missing or incomplete');
  }

  const image = await createImage(imageSrc);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Ensure crop dimensions do not exceed image bounds
  const cropX = Math.max(0, crop.x);
  const cropY = Math.max(0, crop.y);
  const cropWidth = Math.min(crop.width, image.width - cropX);
  const cropHeight = Math.min(crop.height, image.height - cropY);

  // Set canvas dimensions to crop size
  canvas.width = cropWidth;
  canvas.height = cropHeight;

  // Draw the cropped image onto the canvas
  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );

  // Attempt to detect the format from image source or default to PNG
  const format = imageSrc.includes('image/jpeg')
    ? 'image/jpeg'
    : imageSrc.includes('image/gif')
    ? 'image/gif'
    : 'image/png';

  // Convert canvas content to Blob and return it
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty or failed to create blob'));
          return;
        }
        // Create a file object from the blob
        const file = new File([blob], `cropped-image.${format.split('/')[1]}`, {
          type: format,
        });
        resolve(file);
      },
      format, // Dynamic format
      format === 'image/jpeg' ? 0.9 : undefined // Quality only for JPEG
    );
  });
};
