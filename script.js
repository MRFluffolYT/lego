const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const upload = document.getElementById("imageUpload");
const detailSlider = document.getElementById("detailSlider");
const detailValue = document.getElementById("detailValue");
const summaryDiv = document.getElementById("summary");
const pdfBtn = document.getElementById("generatePDF");

// Palette colori LEGO base (8 colori)
const legoColors = ["#ff0000","#00ff00","#0000ff","#ffff00","#ffa500","#800080","#ffffff","#000000"];

let pixelData = []; // matrice pixel colorati
let numCells = parseInt(detailSlider.value);

detailSlider.addEventListener("input",()=>{
  numCells = parseInt(detailSlider.value);
  detailValue.textContent = numCells;
  if(canvas.image) processImage(canvas.image);
});

// Carica immagine
upload.addEventListener("change",(e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const img = new Image();
  img.onload = ()=> { 
    canvas.image = img; 
    processImage(img); 
  };
  img.src = URL.createObjectURL(file);
});

// Funzione principale
function processImage(img){
  // Ridimensiona immagine in pixel grid
  const w = numCells;
  const h = Math.round(numCells * img.height / img.width);
  canvas.width = w * 20; // 20px per cella
  canvas.height = h * 20;

  // Canvas temporaneo
  const temp = document.createElement("canvas");
  temp.width = w;
  temp.height = h;
  const tctx = temp.getContext("2d");
  tctx.drawImage(img,0,0,w,h);

  pixelData = [];
  for(let y=0;y<h;y++){
    const row = [];
    for(let x=0;x<w;x++){
      const d = tctx.getImageData(x,y,1,1).data;
      const color = closestLEGOColor(d);
      row.push(color);
    }
    pixelData.push(row);
  }
  drawGrid();
  updateSummary();
}

// Trova il colore LEGO più vicino
function closestLEGOColor([r,g,b]){
  let minDist = Infinity, closest = legoColors[0];
  legoColors.forEach(c=>{
    const cr = parseInt(c.slice(1,3),16);
    const cg = parseInt(c.slice(3,5),16);
    const cb = parseInt(c.slice(5,7),16);
    const dist = Math.sqrt((r-cr)**2+(g-cg)**2+(b-cb)**2);
    if(dist<minDist){ minDist=dist; closest=c; }
  });
  return closest;
}

// Disegna griglia
function drawGrid(){
  const cellSize = 20;
  pixelData.forEach((row,y)=>{
    row.forEach((color,x)=>{
      ctx.fillStyle=color;
      ctx.fillRect(x*cellSize,y*cellSize,cellSize,cellSize);
      ctx.strokeStyle="#ccc";
      ctx.strokeRect(x*cellSize,y*cellSize,cellSize,cellSize);
    });
  });
}

// Riepilogo mattoncini
function updateSummary(){
  const count = {};
  pixelData.forEach(row=>row.forEach(cell=>{ count[cell]=(count[cell]||0)+1; }));
  summaryDiv.innerHTML = "<h3>Riepilogo mattoncini:</h3>"+Object.entries(count).map(([c,n])=>`${c}: ${n}`).join("<br>");
}

// Genera PDF
pdfBtn.addEventListener("click",()=>{
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  const cell = 5; // mm per cella
  pixelData.forEach((row,y)=>{
    row.forEach((color,x)=>{
      pdf.setFillColor(color);
      pdf.rect(x*cell,y*cell,cell,cell,"F");
    });
  });
  pdf.save("lego-photo.pdf");
});
