const loginBox = document.getElementById("login");
const scannerBox = document.getElementById("scanner");
const resultBox = document.getElementById("result");
const video = document.getElementById("video");

function login(){
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;
  if(u==="inspector" && p==="citymetro"){
    loginBox.hidden = true;
    scannerBox.hidden = false;
    startCamera();
  } else {
    alert("Access denied");
  }
}

function startCamera(){
  navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}})
  .then(stream => video.srcObject = stream);
  scan();
}

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

function scan(){
  if(video.readyState === video.HAVE_ENOUGH_DATA){
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video,0,0);
    const imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
    const code = jsQR(imgData.data,canvas.width,canvas.height);
    if(code) validate(code.data);
  }
  requestAnimationFrame(scan);
}

function validate(id){
  const ticket = JSON.parse(localStorage.getItem(id));
  if(!ticket){ show("INVALID TICKET ❌"); return; }

  const now = Date.now();
  let activatedText = "Not yet";

  // Single ride activation (first use)
  if(ticket.singles > 0 && !ticket.activated){
    ticket.activated = now;
    ticket.singles--;
    localStorage.setItem(ticket.id, JSON.stringify(ticket));
  }

  if(ticket.activated) activatedText = new Date(ticket.activated).toLocaleString();

  // Calculate validity
  let singleStatus = ticket.singles > 0 ? "Available" : "Used";
  let dayStatus = "None";
  let weekStatus = "None";

  // Day Pass: valid 24 hours from activation
  if(ticket.dayPasses > 0){
    if(!ticket.dayActivated) ticket.dayActivated = now;
    const expire = ticket.dayActivated + 24*60*60*1000;
    dayStatus = now < expire ? `Active (expires ${new Date(expire).toLocaleString()})` : "Expired";
  }

  // Week Pass: valid 7 days from activation
  if(ticket.weekPasses > 0){
    if(!ticket.weekActivated) ticket.weekActivated = now;
    const expire = ticket.weekActivated + 7*24*60*60*1000;
    weekStatus = now < expire ? `Active (expires ${new Date(expire).toLocaleString()})` : "Expired";
  }

  show("VALID ✅", ticket, activatedText, singleStatus, dayStatus, weekStatus);
}

function show(status, ticket={}, activatedText="", singleStatus="", dayStatus="", weekStatus=""){
  resultBox.hidden = false;
  resultBox.innerHTML = `<h3>${status}</h3>
    <p>ID: ${ticket.id}</p>
    <p>Name: ${ticket.name}</p>
    <p>Singles left: ${ticket.singles} (${singleStatus})</p>
    <p>Day Passes: ${ticket.dayPasses} (${dayStatus})</p>
    <p>Week Passes: ${ticket.weekPasses} (${weekStatus})</p>
    <p>Single ride activated at: ${activatedText}</p>`;
}
