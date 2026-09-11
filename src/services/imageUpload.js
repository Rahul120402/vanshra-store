// High-Speed, Lightweight Image Optimizer for VANSHRA
// Converts local device photos into crisp, ultra-light WebP images (~15-25KB)

export const precompressImage = (file, maxWidth = 800, quality = 0.75) => {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith("image/")) {
      return resolve("");
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

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
      img.onerror = () => resolve(event.target?.result || "");
      img.src = event.target?.result;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
};

export const uploadProductPhotoToCloud = async (file) => {
  if (!file) return "";
  try {
    const optimized = await precompressImage(file, 800, 0.75);
    return optimized || "";
  } catch (err) {
    console.warn("[VANSHRA Image Optimizer] Compression failed:", err);
    return "";
  }
};
