// ============================
// 🔴 YOU MUST CHANGE THESE 🔴
// ============================
emailjs.init("hFJFYEsqIK88SbfAb");
const SERVICE_ID = "noreply_citymetro";
const TEMPLATE_ID = "brickpass_ticket";
// ============================

let userData = {};

document.getElementById("ticketForm").addEventListener("submit", function(e) {
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

document.getElementById("confirmBtn").addEventListener("click", function() {
  const ticketId = "CM-" + Math.floor(Math.random() * 1000000);

  new QRious({
    element: document.getElementById("qr"),
    value:
      "City Metro Ticket\n" +
      userData.ticket + "\n" +
      "Passenger: " + userData.name + "\n" +
      "Ticket ID: " + ticketId,
    size: 200
  });

  emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    name: userData.name,
    email: userData.email,
    ticket: userData.ticket,
    ticket_id: ticketId
  });

  document.getElementById("confirm").hidden = true;
  document.getElementById("success").hidden = false;
});
