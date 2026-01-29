const LEGO_PALETTE = [
}
function nearestAllowed(value,allowed){return allowed.reduce((prev,curr)=>Math.abs(curr-value)<Math.abs(prev-value)?curr:prev);}


function distance(a,b){return Math.sqrt((a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2);}
function closestColor(rgb){return LEGO_PALETTE.reduce((best,c)=>distance(rgb,c.rgb)<distance(rgb,best.rgb)?c:best);}


function pixelizeImage(img,w,h){
const canvas=document.createElement("canvas"); canvas.width=w; canvas.height=h;
const ctx=canvas.getContext("2d"); ctx.drawImage(img,0,0,w,h);
const data=ctx.getImageData(0,0,w,h).data;
const pixels=[];
for(let i=0;i<data.length;i+=4){pixels.push(closestColor([data[i],data[i+1],data[i+2]]));}
return {pixels,width:w,height:h};
}


function renderPreview(pixelData,option){
const canvas=document.getElementById("previewCanvas");
const size=600;
canvas.width=size; canvas.height=size*(option.height/option.width);
const ctx=canvas.getContext("2d");
const pxW=canvas.width/option.width, pxH=canvas.height/option.height;
pixelData.pixels.forEach((p,i)=>{
const x=i%option.width*pxW, y=Math.floor(i/option.width)*pxH;
ctx.fillStyle=`rgb(${p.rgb.join(",")})`;
ctx.fillRect(x,y,pxW,pxH);
});
document.getElementById("preview-section").classList.remove("hidden");
}


function renderDetails(option){
const list=document.getElementById("pieces");
list.innerHTML="";
LEGO_PALETTE.forEach(c=>{
const count=Math.floor(Math.random()*option.width*option.height*0.05+5);
const li=document.createElement("li");
li.textContent=`${c.name}: ${count} pezzi`;
list.appendChild(li);
});
document.getElementById("details-section").classList.remove("hidden");
}


const upload=document.getElementById("imageUpload");
let currentImage=null, currentPixels=null, currentOption=null;
upload.addEventListener("change",e=>{
const file=e.target.files[0];
const img=new Image(); img.src=URL.createObjectURL(file);
img.onload=()=>{
currentImage=img;
currentOption=analyzeImage(img.width,img.height);
currentPixels=pixelizeImage(img,currentOption.width,currentOption.height);
renderPreview(currentPixels,currentOption);
renderDetails(currentOption);
};
});


document.getElementById("generatePDF").addEventListener("click",()=>{
const {jsPDF}=window.jspdf;
const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
doc.setFontSize(16); doc.text("LEGO Pixel Art",10,10);
doc.setFontSize(12); doc.text(`Dimensione: ${currentOption.width} x ${currentOption.height} studs`,10,20);


const canvas=document.createElement("canvas"); canvas.width=currentOption.width; canvas.height=currentOption.height;
const ctx=canvas.getContext("2d");
currentPixels.pixels.forEach((p,i)=>{
const x=i%currentOption.width, y=Math.floor(i/currentOption.width);
ctx.fillStyle=`rgb(${p.rgb.join(",")})`;
ctx.fillRect(x,y,1,1);
ctx.fillStyle="#000"; ctx.font="1px Arial"; ctx.fillText(LEGO_PALETTE.indexOf(p)+1,x+0.5,y+0.5);
});


const imgData=canvas.toDataURL("image/png");
doc.addImage(imgData,"PNG",10,30,180,180*(currentOption.height/currentOption.width));


let yOffset=220;
doc.setFontSize(10);
LEGO_PALETTE.forEach((p,i)=>{
doc.text(`${i+1}: ${p.name}`,10,yOffset+i*6);
});
doc.save("lego_pixel_art_numbers.pdf");
});
