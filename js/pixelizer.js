import { LEGO_PALETTE } from "./legoPalette.js";

function distance(a, b) {
  return Math.sqrt(
    (a[0]-b[0])**2 +
    (a[1]-b[1])**2 +
    (a[2]-b[2])**2
  );
}

function closestColor(rgb) {
  return LEGO_PALETTE.reduce((best, c) =>
    distance(rgb, c.rgb) < distance(rgb, best.rgb) ? c : best
  );
}

export function pixelizeImage(img, w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);

  const data = ctx.getImageData(0, 0, w, h).data;
  const pixels = [];

  for (let i = 0; i < data.length; i += 4) {
    pixels.push(closestColor([data[i], data[i+1], data[i+2]]));
  }

  return { pixels, width: w, height: h };
}
