import { analyzeImage } from "./imageAnalyzer.js";
import { renderOptions } from "./ui.js";
import { renderPreview } from "./previewRenderer.js";
import { pixelizeImage } from "./pixelizer.js";

const upload = document.getElementById("imageUpload");

upload.addEventListener("change", e => {
  const file = e.target.files[0];
  const img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = () => {
    const analysis = analyzeImage(img.width, img.height);
    renderOptions(analysis, option => {
      const pixels = pixelizeImage(img, option.width, option.height);
      renderPreview(pixels, option);
    });
  };
});
