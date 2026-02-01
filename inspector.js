const loginBox = document.getElementById("login");
const scannerBox = document.getElementById("scanner");
const resultBox = document.getElementById("result");
const video = document.getElementById("video");

// Staff login
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

// Start camera for QR scanning
function startCamera(){
  navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}})
    .then(stream => video.srcObject = stream)
    .catch(err => console.error(err));
  scan();
}

// Create canvas for QR processing
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

// Main scan loop
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

// Validate ticket and automatically pick pass
function validate(id){
  const ticket = JSON.parse(localStorage.getItem(id));
  if(!ticket){ show("INVALID TICKET ❌"); return; }

  const now = Date.now();
  let usedPassType = null;

  // Single ride: priority #1
  if(ticket.singles > 0){
    usedPassType = "Single";
    ticket.singles--;
    if(!ticket.activated) ticket.activated = now;
  }
  // Day pass: priority #2
  else if(ticket.dayPasses > 0){
    usedPassType = "Day";
    if(!ticket.dayActivated) ticket.dayActivated = now;
  }
  // Week pass: priority #3
  else if(ticket.weekPasses > 0){
    usedPassType = "Week";
    if(!ticket.weekActivated) ticket.weekActivated = now;
  }

  // Save updated ticket
  localStorage.setItem(ticket.id, JSON.stringify(ticket));

  // Compute validity and expiration
  let singleStatus = ticket.singles > 0 ? "Available" : "None";
  let dayStatus = "None";
  let weekStatus = "None";

  // Single validity: 2 hours from activation
  if(ticket.activated){
    const expire = ticket.activated + 2*60*60*1000;
    singleStatus = now < expire ? `Active (expires ${new Date(expire).toLocaleTimeString()})` : "Expired";
  }

  // Day pass validity: 24 hours
  if(ticket.dayPasses > 0){
    if(ticket.dayActivated){
      const expire = ticket.dayActivated + 24*60*60*1000;
      dayStatus = now < expire ? `Active (expires ${new Date(expire).toLocaleString()})` : "Expired";
    } else {
      dayStatus = "Not yet activated";
    }
  }

  // Week pass validity: 7 days
  if(ticket.weekPasses > 0){
    if(ticket.weekActivated){
      const expire = ticket.weekActivated + 7*24*60*60*1000;
      weekStatus = now < expire ? `Active (expires ${new Date(expire).toLocaleString()})` : "Expired";
    } else {
      weekStatus = "Not yet activated";
    }
  }

  show(`VALID ✅ (${usedPassType || "No valid pass"})`, ticket, singleStatus, dayStatus, weekStatus);
}

// Display ticket info to inspector
function show(status, ticket={}, singleStatus="", dayStatus="", weekStatus=""){
  resultBox.hidden = false;
  resultBox.innerHTML = `<h3>${status}</h3>
    <p>ID: ${ticket.id}</p>
    <p>Name: ${ticket.name}</p>
    <p>Singles left: ${ticket.singles} (${singleStatus})</p>
    <p>Day Passes: ${ticket.dayPasses} (${dayStatus})</p>
    <p>Week Passes: ${ticket.weekPasses} (${weekStatus})</p>
    <p>Single ride activated at: ${ticket.activated ? new Date(ticket.activated).toLocaleString() : "Not yet"}</p>
    <p>Day pass activated at: ${ticket.dayActivated ? new Date(ticket.dayActivated).toLocaleString() : "Not yet"}</p>
    <p>Week pass activated at: ${ticket.weekActivated ? new Date(ticket.weekActivated).toLocaleString() : "Not yet"}</p>`;
}
