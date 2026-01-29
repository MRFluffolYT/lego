let img=null, pixelData=null, widthStuds=32, heightStuds=32;
const upload=document.getElementById("imageUpload"), previewCanvas=document.getElementById("previewCanvas");


function distance(a,b){return Math.sqrt((a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2);}
function closestColor(rgb){return window.LEGO_1x1_PARTS.reduce((best,c)=>distance(rgb,c.rgb)<distance(rgb,best.rgb)?c:best);}


function generatePixels(w,h){
const canvas=document.createElement("canvas"); canvas.width=w; canvas.height=h;
const ctx=canvas.getContext("2d"); ctx.drawImage(img,0,0,w,h);
const data=ctx.getImageData(0,0,w,h).data; pixelData=[];
for(let i=0;i<data.length;i+=4) pixelData.push(closestColor([data[i],data[i+1],data[i+2]]));
renderPreview();
}


function renderPreview(){
const ctx=previewCanvas.getContext("2d"); previewCanvas.width=600; previewCanvas.height=600*(heightStuds/widthStuds);
const pxW=previewCanvas.width/widthStuds, pxH=previewCanvas.height/heightStuds;
ctx.clearRect(0,0,previewCanvas.width,previewCanvas.height);
pixelData.forEach((p,i)=>{
const x=i%widthStuds*pxW, y=Math.floor(i/widthStuds)*pxH;
ctx.fillStyle=p.hex; ctx.fillRect(x,y,pxW,pxH);
ctx.fillStyle="#000"; ctx.font=`${pxW*0.5}px Arial`; ctx.textAlign="center"; ctx.textBaseline="middle";
ctx.fillText(p.number,x+pxW/2,y+pxH/2);
});
}


function suggestSizes(imgWidth,imgHeight){
const aspectRatio=imgWidth/imgHeight, sizes=[];
[16,32,48,64].forEach(n=>sizes.push({w:n,h:Math.round(n/aspectRatio)}));
const commonRatios=[{ratio:16/9},{ratio:4/3},{ratio:3/2}];
commonRatios.forEach(r=>{ let w=64,h=Math.round(w/r.ratio); sizes.push({w:Math.round(h*r.ratio),h:h}); });
const container=document.getElementById("suggestedSizes"); container.innerHTML="";
sizes.forEach(s=>{ const btn=document.createElement("button"); btn.textContent=`${s.w} x ${s.h}`; btn.dataset.width=s.w; btn.dataset.height=s.h; btn.classList.add("sizeOption"); container.appendChild(btn); });
document.querySelectorAll(".sizeOption").forEach(btn=>{ btn.addEventListener("click",e=>{ widthStuds=parseInt(e.target.dataset.width); heightStuds=parseInt(e.target.dataset.height); generatePixels(widthStuds,heightStuds); }); });
}


upload.addEventListener("change",e=>{ img=new Image(); img.src=URL.createObjectURL(e.target.files[0]); img.onload=()=>{ generatePixels(img.width,img.height); document.getElementById("preview-section").classList.remove("hidden"); document.getElementById("size-section").classList.remove("hidden"); document.getElementById("pdf-section").classList.remove("hidden"); suggestSizes(img.width,img.height); }; });


document.getElementById("applySize").addEventListener("click",()=>{ const w=parseInt(document.getElementById("widthInput").value), h=parseInt(document.getElementById("heightInput").value); if(w>0&&h>0){ widthStuds=w; heightStuds=h; generatePixels(w,h); } });


document.getElementById("generatePDF").addEventListener("click",()=>{
const {jsPDF}=window.jspdf, doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
doc.setFontSize(16); doc.text("LEGO Pixel Art",10,10); doc.setFontSize(12); doc.text(`Dimensione: ${widthStuds} x ${heightStuds} studs`,10,20);
const canvas=document.createElement("canvas"); canvas.width=widthStuds; canvas.height=heightStuds; const ctx=canvas.getContext("2d");
pixelData.forEach((p,i)=>{ const x=i%widthStuds, y=Math.floor(i/widthStuds); ctx.fillStyle=p.hex; ctx.fillRect(x,y,1,1); ctx.fillStyle="#000"; ctx.font="1px Arial"; ctx.fillText(p.number,x+0.5,y+0.5); });
const imgData=canvas.toDataURL("image/png"); doc.addImage(imgData,"PNG",10,30,180,180*(heightStuds/widthStuds));
let yOffset=220; doc.setFontSize(10); doc.text("Legenda colori:",10,yOffset); yOffset+=10;
window.LEGO_1x1_PARTS.forEach((p,i)=>{ const link=`https://www.lego.com/it-it/pick-and-build/pick-a-brick/color/${p.colorName.toLowerCase().replace(" ","-")}`; doc.text(`${p.number}: ${p.colorName} | Design ID: ${p.designID} | Element ID: ${p.elementID} | Link: ${link}`,10,yOffset+i*6); });
doc.save("lego_pixel_art_professional.pdf");
});
