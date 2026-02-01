// ============================
// 🔴 YOU MUST CHANGE THESE 🔴
// ============================
emailjs.init("hFJFYEsqIK88SbfAb");
const SERVICE_ID = "noreply_citymetro";
const TEMPLATE_ID = "brickpass_ticket";
// ====================================

let userData = {};

// STEP 1 → Payment form submit
document.getElementById("ticketForm").addEventListener("submit", function (e) {
  e.preventDefault();

  userData.ticket = document.getElementById("ticket").value;
  userData.name = document.getElementById("name").value;
  userData.email = document.getElementById("email").value;

  document.getElementById("cTicket").textContent = userData.ticket;
  document.getElementById("cName").textContent = userData.name;
  document.getElementById("cEmail").textContent = userData.email;

  document.getElementById("ticketForm").hidden = true;
  document.getElementById("confirm").hidden = false;
});

// STEP 2 → Confirm purchase
document.getElementById("confirmBtn").addEventListener("click", function () {
  const now = Date.now();

  let type;
  let expires;

  if (userData.ticket.includes("Single")) {
    type = "single";
    expires = now + 1000 * 60 * 60; // 1 hour
  } else if (userData.ticket.includes("Day")) {
    type = "day";
    expires = now + 1000 * 60 * 60 * 24;
  } else {
    type = "week";
    expires = now + 1000 * 60 * 60 * 24 * 7;
  }

  const ticketData = {
    system: "City Metro",
    id: "CM-" + Math.floor(Math.random() * 1000000),
    name: userData.name,
    type: type,
    expires: expires
  };

  // Generate QR code
  const qrCanvas = document.getElementById("qr");
  new QRious({
    element: qrCanvas,
    value: JSON.stringify(ticketData),
    size: 220
  });

  // Convert QR to image for email
  const qrImage = qrCanvas.toDataURL("image/png");

  // Send email (NON-BLOCKING — app continues even if it fails)
  emailjs
    .send(SERVICE_ID, TEMPLATE_ID, {
      name: userData.name,
      ticket: userData.ticket,
      ticket_id: ticketData.id,
      qr_image: qrImage
    })
    .then(
      () => console.log("Email sent successfully"),
      (err) => console.error("Email failed:", err)
    );

  // STEP 3 → Always show success screen
  document.getElementById("confirm").hidden = true;
  document.getElementById("success").hidden = false;
});;
