// Pixel art + PDF generator
let img = null;
let pixelData = null;
let widthStuds = 32;
let heightStuds = 32;

const upload = document.getElementById("imageUpload");
const previewCanvas = document.getElementById("previewCanvas");

upload.addEventListener("change", e => {
  img = new Image();
  img.src = URL.createObjectURL(e.target.files[0]);
  img.onload = () => {
    widthStuds = 32;
    heightStuds = Math.round(widthStuds * (img.height/img.width));
    generatePixels(widthStuds, heightStuds);
    document.getElementById("preview-section").classList.remove("hidden");
    document.getElementById("size-section").classList.remove("hidden");
    document.getElementById("pdf-section").classList.remove("hidden");
  }
});

document.getElementById("applySize").addEventListener("click", () => {
  const w = parseInt(document.getElementById("widthInput").value);
  const h = parseInt(document.getElementById("heightInput").value);
  if(w>0 && h>0) { widthStuds=w; heightStuds=h; generatePixels(w,h); }
});

// Funzioni utility
function distance(a,b){return Math.sqrt((a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2);}
function closestColor(rgb){
  return window.LEGO_1x1_PARTS.reduce((best,c)=>distance(rgb,c.rgb)<distance(rgb,best.rgb)?c:best);
}

function generatePixels(w,h){
  const canvas=document.createElement("canvas"); canvas.width=w; canvas.height=h;
  const ctx=canvas.getContext("2d");
  ctx.drawImage(img,0,0,w,h);
  const data=ctx.getImageData(0,0,w,h).data;
  pixelData=[];
  for(let i=0;i<data.length;i+=4){
    pixelData.push(closestColor([data[i],data[i+1],data[i+2]]));
  }
  renderPreview();
}

function renderPreview(){
  const ctx=previewCanvas.getContext("2d");
  previewCanvas.width = 600;
  previewCanvas.height = 600*(heightStuds/widthStuds);
  const pxW = previewCanvas.width/widthStuds;
  const pxH = previewCanvas.height/heightStuds;
  pixelData.forEach((p,i)=>{
    const x=i%widthStuds*pxW;
    const y=Math.floor(i/widthStuds)*pxH;
    ctx.fillStyle=p.hex;
    ctx.fillRect(x,y,pxW,pxH);
  });
}

// PDF generator
document.getElementById("generatePDF").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({orientation:"portrait", unit:"mm", format:"a4"});
  doc.setFontSize(16);
  doc.text("LEGO Pixel Art",10,10);
  doc.setFontSize(12);
  doc.text(`Dimensione: ${widthStuds} x ${heightStuds} studs`,10,20);

  // Canvas anteprima
  const canvas = document.createElement("canvas");
  canvas.width = widthStuds;
  canvas.height = heightStuds;
  const ctx = canvas.getContext("2d");
  pixelData.forEach((p,i)=>{
    const x=i%widthStuds;
    const y=Math.floor(i/widthStuds);
    ctx.fillStyle=p.hex;
    ctx.fillRect(x,y,1,1);
  });
  const imgData = canvas.toDataURL("image/png");
  doc.addImage(imgData,"PNG",10,30,180,180*(heightStuds/widthStuds));

  // Tabella pezzi
  const counts={};
  pixelData.forEach(p=>{
    const key=p.colorName;
    counts[key]=(counts[key]||0)+1;
  });

  let yOffset=220; doc.setFontSize(10); doc.text("Lista pezzi:",10,yOffset); yOffset+=10;
  Object.keys(counts).forEach((color,i)=>{
    const qty = counts[color];
    const part = window.LEGO_1x1_PARTS.find(p=>p.colorName===color);
    const link = `https://www.lego.com/it-it/pick-and-build/pick-a-brick/color/${color.toLowerCase().replace(" ","-")}`;
    doc.text(`${color} | Design ID: ${part.designID} | Element ID: ${part.elementID} | Quantità: ${qty} | Link: ${link}`,10,yOffset+i*6);
  });

  doc.save("lego_pixel_art.pdf");
});
