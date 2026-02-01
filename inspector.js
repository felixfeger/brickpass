function login() {
  if (user.value === "inspector" && pass.value === "citymetro") {
    login.hidden = true;
    scanner.hidden = false;
    startCamera();
  } else {
    alert("Access denied");
  }
}

function startCamera() {
  navigator.mediaDevices.getUserMedia({ video: { facingMode:"environment" } })
    .then(s => video.srcObject = s);
  scan();
}

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

function scan() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video,0,0);

    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const code = jsQR(img.data, canvas.width, canvas.height);

    if (code) validate(code.data);
  }
  requestAnimationFrame(scan);
}

function validate(data) {
  try {
    const t = JSON.parse(data);
    const now = Date.now();
    const used = JSON.parse(localStorage.getItem("usedTickets") || "{}");

    if (now > t.expires) return show("EXPIRED ❌", t);

    if (t.type === "single") {
      if (used[t.id]) return show("ALREADY USED ❌", t);
      used[t.id] = true;
      localStorage.setItem("usedTickets", JSON.stringify(used));
    }

    show("VALID ✅", t);
  } catch {
    show("INVALID TICKET ❌");
  }
}

function show(status, t={}) {
  result.hidden = false;
  result.innerHTML = `
    <h3>${status}</h3>
    ${t.id ? `
      <p>ID: ${t.id}</p>
      <p>Name: ${t.name}</p>
      <p>Type: ${t.type}</p>` : ""}
  `;
}
