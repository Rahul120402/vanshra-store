// VANSHRA - Cloudinary Image Upload Service
// Images are uploaded to Cloudinary (free CDN) so only a URL is stored in Firestore.
// This removes the 1MB per-document Firestore limit and enables unlimited products.

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";

const isCloudinaryConfigured = () =>
  Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);

// Compress image locally before upload (reduces bandwidth usage)
const compressBeforeUpload = (file, maxWidth = 1200, quality = 0.85) => {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith("image/")) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => resolve(blob || file),
          "image/webp",
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

// Upload a file to Cloudinary, return the secure CDN URL
const uploadToCloudinary = async (file) => {
  const compressed = await compressBeforeUpload(file);

  const formData = new FormData();
  formData.append("file", compressed);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", "vanshra_products");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudinary upload failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  // Return secure HTTPS URL
  return data.secure_url || data.url || "";
};

// Fallback: convert to base64 data-URL if Cloudinary is not configured
const convertToBase64 = (file, maxWidth = 800, quality = 0.75) => {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith("image/")) return resolve("");

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        let result = canvas.toDataURL("image/webp", quality);
        if (!result.startsWith("data:image/webp")) {
          result = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(result);
      };
      img.onerror = () => resolve("");
      img.src = e.target?.result;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
};

// Main export - always call this when uploading a product photo
export const uploadProductPhotoToCloud = async (file) => {
  if (!file) return "";

  try {
    if (isCloudinaryConfigured()) {
      // PRIMARY: Upload to Cloudinary, store just a URL in Firestore
      const url = await uploadToCloudinary(file);
      return url;
    } else {
      // FALLBACK: Store base64 inline (works but has 1MB Firestore limit per doc)
      console.warn("[VANSHRA] Cloudinary not configured - using base64 fallback. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to .env");
      return await convertToBase64(file);
    }
  } catch (err) {
    console.warn("[VANSHRA Image Upload] Failed:", err.message);
    // Try base64 as last resort
    try {
      return await convertToBase64(file);
    } catch {
      return "";
    }
  }
};

// Kept for backward compatibility
export const precompressImage = convertToBase64;
