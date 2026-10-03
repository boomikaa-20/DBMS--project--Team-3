import { useState } from "react";

const API = "http://localhost:8000";

function CheckIn() {
  const [ticketCode, setTicketCode] = useState("");
  const [message, setMessage] = useState("");
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkInTicket = async (e) => {
    e.preventDefault();

    if (!ticketCode.trim()) {
      setMessage("Please enter a ticket code.");
      return;
    }

    setLoading(true);
    setMessage("");
    setTicket(null);

    try {
      const response = await fetch(`${API}/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticket_code: ticketCode.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Check-in failed.");
        setLoading(false);
        return;
      }

      setTicket(data);
      setMessage("Ticket checked in successfully!");
      setTicketCode("");
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to backend.");
    }

    setLoading(false);
  };

  return (
    <div className="checkin-page">

      <div className="checkin-card">

        <h1>Eventify</h1>

        <h2>Organizer Check-In</h2>

        <p>Validate attendee tickets at the event entrance.</p>

        <form onSubmit={checkInTicket}>

          <input
            type="text"
            placeholder="Enter Ticket Code"
            value={ticketCode}
            onChange={(e) => setTicketCode(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Checking..." : "Check In"}
          </button>

        </form>

        {message && (
          <div className="checkin-message">
            {message}
          </div>
        )}

        {ticket && (
          <div className="ticket-result">

            <h3>✅ Ticket Valid</h3>

            <p>
              <strong>Ticket Code:</strong>{" "}
              {ticket.ticket_code}
            </p>

            <p>
              <strong>Attendee:</strong>{" "}
              {ticket.customer_name}
            </p>

            <p>
              <strong>Event:</strong>{" "}
              {ticket.event_name}
            </p>

            <p>
              <strong>Status:</strong> Checked In
            </p>

          </div>
        )}

      </div>

    </div>
  );
}

export default CheckIn;