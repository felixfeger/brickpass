<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>City Metro | Inspector</title>
<link rel="stylesheet" href="style.css">

<!-- QR Scanner Library -->
<script src="https://cdn.jsdelivr.net/npm/jsqr/dist/jsQR.js"></script>
</head>
<body>
<div class="card">
  <h1>City Metro | Inspector</h1>

  <!-- Login -->
  <div id="login">
    <label>Username:</label>
    <input id="user" placeholder="inspector">
    <label>Password:</label>
    <input id="pass" type="password" placeholder="citymetro">
    <button onclick="login()">Login</button>
  </div>

  <!-- QR Scanner -->
  <div id="scanner" hidden>
    <p>Point camera at passenger QR code</p>
    <video id="video" width="300" height="300" autoplay></video>

    <div id="result" hidden style="margin-top:20px; border:1px solid #0a1f44; padding:10px;"></div>
  </div>
</div>

<script>
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

// Start camera for scanning
function startCamera(){
  navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}})
    .then(stream => video.srcObject = stream)
    .catch(err => console.error(err));
  scan();
}

// Create canvas for QR scanning
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

// Validate ticket and activate a pass
function validate(id){
  const ticket = JSON.parse(localStorage.getItem(id));
  if(!ticket){ show("INVALID TICKET ❌"); return; }

  const now = Date.now();
  let usedPassType = null;
  let passUsed = false;

  // ---- SINGLE RIDE ----
  if(ticket.singles > 0){
    if(!ticket.activated){
      ticket.activated = now; // first use timestamp
      ticket.singles--;
      usedPassType = "Single";
      passUsed = true;
    } else {
      const expire = ticket.activated + 2*60*60*1000; // 2 hours
      if(now < expire){
        ticket.singles--;
        usedPassType = "Single";
        passUsed = true;
      }
    }
  }

  // ---- DAY PASS ----
  if(!passUsed && ticket.dayPasses > 0){
    if(!ticket.dayActivated){
      ticket.dayActivated = now;
      usedPassType = "Day";
      passUsed = true;
    } else {
      const expire = ticket.dayActivated + 24*60*60*1000;
      if(now < expire){
        usedPassType = "Day";
        passUsed = true;
      }
    }
  }

  // ---- WEEK PASS ----
  if(!passUsed && ticket.weekPasses > 0){
    if(!ticket.weekActivated){
      ticket.weekActivated = now;
      usedPassType = "Week";
      passUsed = true;
    } else {
      const expire = ticket.weekActivated + 7*24*60*60*1000;
      if(now < expire){
        usedPassType = "Week";
        passUsed = true;
      }
    }
  }

  // Save updated ticket
  localStorage.setItem(ticket.id, JSON.stringify(ticket));

  // Compute statuses
  let singleStatus = "None";
  let dayStatus = "None";
  let weekStatus = "None";

  if(ticket.activated){
    const expire = ticket.activated + 2*60*60*1000;
    singleStatus = now < expire ? `Active (expires ${new Date(expire).toLocaleTimeString()})` : "Expired";
  }
  if(ticket.dayPasses > 0){
    if(ticket.dayActivated){
      const expire = ticket.dayActivated + 24*60*60*1000;
      dayStatus = now < expire ? `Active (expires ${new Date(expire).toLocaleString()})` : "Expired";
    } else dayStatus = "Not yet activated";
  }
  if(ticket.weekPasses > 0){
    if(ticket.weekActivated){
      const expire = ticket.weekActivated + 7*24*60*60*1000;
      weekStatus = now < expire ? `Active (expires ${new Date(expire).toLocaleString()})` : "Expired";
    } else weekStatus = "Not yet activated";
  }

  const statusText = passUsed ? `VALID ✅ (${usedPassType} used)` : "INVALID ❌ (no valid pass)";
  show(statusText, ticket, singleStatus, dayStatus, weekStatus);
}

// Display result
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
</script>
</body>
</html>
