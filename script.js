// ============================
// 🔴 YOU MUST CHANGE THESE 🔴
// ============================
emailjs.init("hFJFYEsqIK88SbfAb");
const SERVICE_ID = "noreply_citymetro";
const TEMPLATE_ID = "brickpass_ticket";
// =======================

let userData = {};

document.getElementById("ticketForm").addEventListener("submit", e => {
  e.preventDefault();

  userData.ticket = ticket.value;
  userData.name = name.value;
  userData.email = email.value;

  cTicket.textContent = userData.ticket;
  cName.textContent = userData.name;
  cEmail.textContent = userData.email;

  ticketForm.hidden = true;
  confirm.hidden = false;
});

confirmBtn.addEventListener("click", () => {
  const now = Date.now();
  let type, expires;

  if (userData.ticket.includes("Single")) {
    type = "single";
    expires = now + 3600000;
  } else if (userData.ticket.includes("Day")) {
    type = "day";
    expires = now + 86400000;
  } else {
    type = "week";
    expires = now + 604800000;
  }

  const ticketData = {
    system: "City Metro",
    id: "CM-" + Math.floor(Math.random() * 1000000),
    name: userData.name,
    type: type,
    expires: expires
  };

  new QRious({
    element: qr,
    value: JSON.stringify(ticketData),
    size: 220
  });

  const qrImage = qr.toDataURL("image/png");

  emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    name: userData.name,
    ticket: userData.ticket,
    ticket_id: ticketData.id,
    qr_image: qrImage
  });

  confirm.hidden = true;
  success.hidden = false;
});
