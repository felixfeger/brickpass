// ============================
// 🔴 YOU MUST CHANGE THESE 🔴
// ============================
emailjs.init("hFJFYEsqIK88SbfAb"); // ← CHANGE THIS

const SERVICE_ID = "noreply_citymetro";     // ← CHANGE THIS
const TEMPLATE_ID = "brickpass_ticket";   // ← CHANGE THIS
// ============================

document.getElementById("ticketForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const ticket = document.getElementById("ticket").value;

  const ticketId = "CM-" + Math.floor(Math.random() * 1000000);

  // Generate QR Code
  new QRious({
    element: document.getElementById("qr"),
    value:
      "City Metro Ticket\n" +
      ticket + "\n" +
      "Passenger: " + name + "\n" +
      "Ticket ID: " + ticketId,
    size: 200
  });

  // Send Email
  emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    name: name,
    email: email,
    ticket: ticket,
    ticket_id: ticketId
  });

  document.getElementById("ticketForm").hidden = true;
  document.getElementById("success").hidden = false;
});
