export function renderPreview(pixelData, option) {
  const canvas = document.getElementById("previewCanvas");
  const size = 600;

  canvas.width = size;
  canvas.height = size * (option.height / option.width);

  const ctx = canvas.getContext("2d");
  const pxW = canvas.width / option.width;
  const pxH = canvas.height / option.height;

  pixelData.pixels.forEach((p, i) => {
    const x = (i % option.width) * pxW;
    const y = Math.floor(i / option.width) * pxH;
    ctx.fillStyle = `rgb(${p.rgb.join(",")})`;
    ctx.fillRect(x, y, pxW, pxH);
  });
}
