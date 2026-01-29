// ----- CONFIG -----
const colors = ["#ff0000","#00ff00","#0000ff","#ffff00","#ffa500","#800080","#ffffff","#000000"];
let selectedColor = colors[0];
let currentLayerIndex = 0;
let brickSize = 1;
const width = 16, height = 16, cellSize = 30;

// ----- LAYERS -----
let layersData = [Array(height).fill(0).map(()=>Array(width).fill(null))];

// ----- PALETTE -----
const toolbar = document.getElementById("toolbar");
colors.forEach(color=>{
  const btn = document.createElement("div");
  btn.className="color-btn";
  btn.style.backgroundColor=color;
  btn.addEventListener("click",()=>{
    selectedColor=color;
    document.querySelectorAll(".color-btn").forEach(b=>b.classList.remove("selected"));
    btn.classList.add("selected");
  });
  if(color===selectedColor) btn.classList.add("selected");
  toolbar.appendChild(btn);
});

// ----- KONVA STAGE -----
const stage = new Konva.Stage({container:'container', width: width*cellSize, height: height*cellSize});
const layer = new Konva.Layer();
stage.add(layer);

function drawGrid(){
  layer.destroyChildren();
  const currentData = layersData[currentLayerIndex];
  for(let r=0;r<height;r++){
    for(let c=0;c<width;c++){
      const cellColor = currentData[r][c] || "#ffffff";
      const rect = new Konva.Rect({
        x: c*cellSize, y: r*cellSize,
        width: cellSize, height: cellSize,
        fill: cellColor,
        stroke:"#ccc"
      });
      rect.on('click',()=>{
        applyBrick(r,c);
      });
      layer.add(rect);
    }
  }
  layer.draw();
}

// ----- APPLY BRICK -----
function applyBrick(r,c){
  const size = parseInt(brickSize);
  const data = layersData[currentLayerIndex];
  for(let dr=0; dr<size; dr++){
    for(let dc=0; dc<size; dc++){
      if(r+dr<height && c+dc<width) data[r+dr][c+dc]=selectedColor;
    }
  }
  drawGrid();
  updateSummary();
}

// ----- UPDATE SUMMARY -----
const summaryDiv = document.getElementById("summary");
function updateSummary(){
  const count = {};
  layersData.forEach((layerData, idx)=>{
    layerData.forEach(row=>row.forEach(cell=>{if(cell) count[cell]=(count[cell]||0)+1}));
  });
  summaryDiv.innerHTML="<h3>Riepilogo mattoncini:</h3>"+Object.entries(count).map(([c,n])=>`${c}: ${n}`).join("<br>");
}

// ----- LAYER CONTROLS -----
const currentLayerSpan = document.getElementById("currentLayer");
document.getElementById("prevLayer").addEventListener("click",()=>{
  if(currentLayerIndex>0) currentLayerIndex--; 
  currentLayerSpan.textContent="Layer "+(currentLayerIndex+1);
  drawGrid();
});
document.getElementById("nextLayer").addEventListener("click",()=>{
  if(currentLayerIndex<layersData.length-1) currentLayerIndex++;
  currentLayerSpan.textContent="Layer "+(currentLayerIndex+1);
  drawGrid();
});
document.getElementById("addLayer").addEventListener("click",()=>{
  layersData.push(Array(height).fill(0).map(()=>Array(width).fill(null)));
  currentLayerIndex=layersData.length-1;
  currentLayerSpan.textContent="Layer "+(currentLayerIndex+1);
  drawGrid();
});

// ----- BRICK SIZE -----
document.getElementById("brickSize").addEventListener("change",(e)=>{brickSize=e.target.value;});

// ----- GENERATE PDF -----
document.getElementById("generatePDF").addEventListener("click",()=>{
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  const pdfCell=10;

  layersData.forEach((layerData, idx)=>{
    layerData.forEach((row,r)=>{
      row.forEach((color,c)=>{
        if(color){
          pdf.setFillColor(color);
          pdf.rect(c*pdfCell,r*pdfCell,pdfCell,pdfCell,"F");
        }
      });
    });
    if(idx<layersData.length-1) pdf.addPage();
  });
  pdf.save("lego-project.pdf");
});

// ----- SAVE / LOAD LOCAL -----
document.getElementById("saveProject").addEventListener("click",()=>{
  const dataStr = JSON.stringify(layersData);
  const blob = new Blob([dataStr],{type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=url;
  a.download="lego-project.json";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("loadProject").addEventListener("click",()=>{document.getElementById("fileInput").click();});
document.getElementById("fileInput").addEventListener("change",(e)=>{
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (ev)=>{
    layersData = JSON.parse(ev.target.result);
    currentLayerIndex=0;
    currentLayerSpan.textContent="Layer 1";
    drawGrid();
    updateSummary();
  };
  reader.readAsText(file);
});

// ----- INIT -----
drawGrid();
updateSummary();
