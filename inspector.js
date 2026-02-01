const loginBox = document.getElementById("login");
const scannerBox = document.getElementById("scanner");
const resultBox = document.getElementById("result");
const video = document.getElementById("video");

function login(){
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;
  if(u==="inspector"&&p==="citymetro"){ loginBox.hidden=true; scannerBox.hidden=false; startCamera();}
  else alert("Access denied");
}

function startCamera(){
  navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}})
  .then(stream=>video.srcObject=stream);
  scan();
}

const canvas=document.createElement("canvas");
const ctx=canvas.getContext("2d");

function scan(){
  if(video.readyState===video.HAVE_ENOUGH_DATA){
    canvas.width=video.videoWidth;
    canvas.height=video.videoHeight;
    ctx.drawImage(video,0,0);
    const imgData=ctx.getImageData(0,0,canvas.width,canvas.height);
    const code=jsQR(imgData.data,canvas.width,canvas.height);
    if(code) validate(code.data);
  }
  requestAnimationFrame(scan);
}

function validate(id){
  const ticket=JSON.parse(localStorage.getItem(id));
  if(!ticket){ show("INVALID TICKET ❌"); return;}
  const now=Date.now();

  // Activate first single ride
  if(ticket.singles>0 && !ticket.activated){
    ticket.activated=now;
    ticket.singles--;
    localStorage.setItem(ticket.id,JSON.stringify(ticket));
  }

  show("VALID ✅", ticket);
}

function show(status, ticket={}){
  resultBox.hidden=false;
  resultBox.innerHTML=`<h3>${status}</h3>
    ${ticket.id?`
    <p>ID: ${ticket.id}</p>
    <p>Name: ${ticket.name}</p>
    <p>Singles left: ${ticket.singles}</p>
    <p>Day Passes: ${ticket.dayPasses}</p>
    <p>Week Passes: ${ticket.weekPasses}</p>
    <p>Activated at: ${ticket.activated?new Date(ticket.activated).toLocaleString():"Not yet"}</p>`:""}`;
}
