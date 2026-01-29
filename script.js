// ----- CONFIG -----
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const upload = document.getElementById("imageUpload");
const detailSlider = document.getElementById("detailSlider");
const detailValue = document.getElementById("detailValue");
const summaryDiv = document.getElementById("summary");
const pdfBtn = document.getElementById("generatePDF");
const addLayerBtn = document.getElementById("addLayer");
const prevLayerBtn = document.getElementById("prevLayer");
const nextLayerBtn = document.getElementById("nextLayer");
const currentLayerSpan = document.getElementById("currentLayer");
const brickSizeSelect = document.getElementById("brickSize");
const saveBtn = document.getElementById("saveProject");
const loadBtn = document.getElementById("loadProject");
const fileInput = document.getElementById("fileInput");

// Palette LEGO estesa (50 colori)
const legoColors = [
  "#ff0000","#00ff00","#0000ff","#ffff00","#ffa500","#800080","#ffffff","#000000",
  "#ff9999","#99ff99","#9999ff","#ffff99","#ffcc99","#cc99ff","#cccccc","#666666",
  "#ff6666","#66ff66","#6666ff","#ffcc66","#ccff66","#66ccff","#ff99cc","#ccff99",
  "#99ccff","#ff9966","#66ffcc","#cc66ff","#9966ff","#66cc66","#ff66cc","#66cc99",
  "#cc9966","#9966cc","#66ff99","#ffcccc","#ccffff","#ffffcc","#ccffcc","#ffccff",
  "#cccc99","#999966","#666699","#996699","#669966","#996666","#669999","#9999cc",
  "#66cccc","#cc66cc","#ffcc99","#99ffcc","#cc99ff","#ccccff","#ff99ff","#99cc99"
];

let selectedBrickSize = parseInt(brickSizeSelect.value);
let numCells = parseInt(detailSlider.value);

let layersData = []; // ogni layer = matrice pixel
let currentLayerIndex = 0;
let pixelData = []; // dati del layer corrente
canvas.image = null;

// ----- EVENTI CONTROLLI -----
detailSlider.addEventListener("input",()=>{
  numCells=parseInt(detailSlider.value);
  detailValue.textContent=numCells;
  if(canvas.image) processImage(canvas.image);
});

brickSizeSelect.addEventListener("change",(e)=>{selectedBrickSize=parseInt(e.target.value);});

upload.addEventListener("change",(e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const img = new Image();
  img.onload = ()=> {
    canvas.image = img;
    layersData = [Array(numCells).fill(0).map(()=>Array(numCells).fill(null))];
    currentLayerIndex=0;
    currentLayerSpan.textContent="Layer 1";
    processImage(img);
  };
  img.src = URL.createObjectURL(file);
});

// ----- FUNZIONE PRINCIPALE -----
function processImage(img){
  const w=numCells;
  const h=Math.round(numCells*img.height/img.width);
  canvas.width=w*20;
  canvas.height=h*20;

  const temp=document.createElement("canvas");
  temp.width=w;
  temp.height=h;
  const tctx=temp.getContext("2d");
  tctx.drawImage(img,0,0,w,h);

  const newData=[];
  for(let y=0;y<h;y++){
    const row=[];
    for(let x=0;x<w;x++){
      const d=tctx.getImageData(x,y,1,1).data;
      row.push(closestLEGOColor(d));
    }
    newData.push(row);
  }
  layersData[currentLayerIndex]=newData;
  pixelData=newData;
  drawGrid();
  updateSummary();
}

// ----- TROVA COLORE LEGO PIU VICINO -----
function closestLEGOColor([r,g,b]){
  let minDist=Infinity, closest=legoColors[0];
  legoColors.forEach(c=>{
    const cr=parseInt(c.slice(1,3),16);
    const cg=parseInt(c.slice(3,5),16);
    const cb=parseInt(c.slice(5,7),16);
    const dist=Math.sqrt((r-cr)**2+(g-cg)**2+(b-cb)**2);
    if(dist<minDist){ minDist=dist; closest=c; }
  });
  return closest;
}

// ----- DISEGNA GRIGLIA -----
function drawGrid(){
  const cellSize=20;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  pixelData.forEach((row,y)=>{
    row.forEach((color,x)=>{
      ctx.fillStyle=color;
      ctx.fillRect(x*cellSize,y*cellSize,cellSize,cellSize);
      ctx.strokeStyle="#ccc";
      ctx.strokeRect(x*cellSize,y*cellSize,cellSize,cellSize);
    });
  });
}

// ----- RIEPILOGO MATTONCINI -----
function updateSummary(){
  const count={};
  layersData.forEach(layer=>layer.forEach(row=>row.forEach(cell=>{ if(cell) count[cell]=(count[cell]||0)+1; })));
  summaryDiv.innerHTML="<h3>Riepilogo mattoncini:</h3>"+Object.entries(count).map(([c,n])=>`${c}: ${n}`).join("<br>");
}

// ----- LAYER CONTROLS -----
addLayerBtn.addEventListener("click",()=>{
  const h = layersData[0].length;
  const w = layersData[0][0].length;
  layersData.push(Array(h).fill(0).map(()=>Array(w).fill(null)));
  currentLayerIndex=layersData.length-1;
  currentLayerSpan.textContent="Layer "+(currentLayerIndex+1);
  pixelData=layersData[currentLayerIndex];
  drawGrid();
  updateSummary();
});

prevLayerBtn.addEventListener("click",()=>{
  if(currentLayerIndex>0) currentLayerIndex--;
  currentLayerSpan.textContent="Layer "+(currentLayerIndex+1);
  pixelData=layersData[currentLayerIndex];
  drawGrid();
  updateSummary();
});

nextLayerBtn.addEventListener("click",()=>{
  if(currentLayerIndex<layersData.length-1) currentLayerIndex++;
  currentLayerSpan.textContent="Layer "+(currentLayerIndex+1);
  pixelData=layersData[currentLayerIndex];
  drawGrid();
  updateSummary();
});

// ----- GENERA PDF -----
pdfBtn.addEventListener("click",()=>{
  const { jsPDF }=window.jspdf;
  const pdf=new jsPDF();
  const cell=5;
  layersData.forEach((layerData,idx)=>{
    layerData.forEach((row,y)=>{
      row.forEach((color,x)=>{
        if(color) pdf.setFillColor(color), pdf.rect(x*cell,y*cell,cell,cell,"F");
      });
    });
    if(idx<layersData.length-1) pdf.addPage();
  });
  pdf.save("lego-photo.pdf");
});

// ----- SAVE/LOAD PROGETTO -----
saveBtn.addEventListener("click",()=>{
  const blob=new Blob([JSON.stringify(layersData)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url; a.download="lego-project.json"; a.click();
  URL.revokeObjectURL(url);
});

loadBtn.addEventListener("click",()=>fileInput.click());
fileInput.addEventListener("change",(e)=>{
  const file=e.target.files[0];
  const reader=new FileReader();
  reader.onload=(ev)=>{
    layersData=JSON.parse(ev.target.result);
    currentLayerIndex=0;
    currentLayerSpan.textContent="Layer 1";
    pixelData=layersData[currentLayerIndex];
    drawGrid();
    updateSummary();
  };
  reader.readAsText(file);
});
