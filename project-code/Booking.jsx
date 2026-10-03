import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../App.css";

const API = "http://localhost:8000";

function Booking() {

  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [ticketCodes, setTicketCodes] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tickets, setTickets] = useState(1);

  const [message, setMessage] = useState("");

  const [user, setUser] = useState(null);


  // -----------------------------
  // CHECK LOGIN
  // -----------------------------

  useEffect(() => {

    const savedUser = localStorage.getItem("user");

    if (!savedUser) {

      navigate("/");

      return;

    }

    setUser(JSON.parse(savedUser));

  }, [navigate]);


  // -----------------------------
  // FETCH EVENTS
  // -----------------------------

  useEffect(() => {

    fetch(`${API}/events`)

      .then((res) => res.json())

      .then((data) => {

        console.log("Events:", data);

        setEvents(data.events || []);

      })

      .catch((error) => {

        console.error(error);

        setMessage("Backend is not connected.");

      });

  }, []);


  // -----------------------------
  // SELECT EVENT
  // -----------------------------

  const selectEvent = (event) => {

    setSelectedEvent(event);

    setMessage("");

    setTicketCodes([]);

    setTimeout(() => {

      document
        .getElementById("booking")
        ?.scrollIntoView({
          behavior: "smooth"
        });

    }, 100);

  };


  // -----------------------------
  // BOOK TICKETS
  // -----------------------------

  const bookTicket = async (e) => {

    e.preventDefault();

    if (!selectedEvent) {

      setMessage("Please select an event first.");

      return;

    }


    try {

      const response = await fetch(`${API}/bookings`, {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          event_id: selectedEvent.event_id,

          customer_name: name,

          email: email,

          tickets: Number(tickets)

        })

      });


      const data = await response.json();


      if (!response.ok) {

        setMessage(data.detail || "Booking failed.");

        return;

      }


      // Save ALL ticket codes
      setTicketCodes(data.ticket_codes || []);


      setMessage(
        `Booking successful! ${data.ticket_codes.length} ticket(s) generated!`
      );


      // Clear form
      setName("");
      setEmail("");
      setTickets(1);


    } catch (error) {

      console.error(error);

      setMessage("Cannot connect to backend.");

    }

  };


  // -----------------------------
  // LOGOUT
  // -----------------------------

  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");

  };


  return (

    <div className="app">


      {/* NAVBAR */}

      <nav className="navbar">

        <div className="logo">
          Eventify
        </div>


        <div className="nav-links">

          <a href="#home">
            Home
          </a>

          <a href="#events">
            Events
          </a>

          <a href="#booking">
            Booking
          </a>


          {user && (
            <span className="welcome">
              Hi, {user.name}
            </span>
          )}


          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </nav>



      {/* HERO */}

      <section
        id="home"
        className="hero"
      >

        <div>

          <h1>
            Event Management & Ticketing Platform
          </h1>

          <p>
            Discover. Book. Experience.
          </p>


          <button

            className="hero-button"

            onClick={() =>
              document
                .getElementById("events")
                ?.scrollIntoView({
                  behavior: "smooth"
                })
            }

          >

            Explore Events

          </button>

        </div>

      </section>



      {/* EVENTS */}

      <section
        id="events"
        className="events-section"
      >

        <h2>
          Upcoming Events
        </h2>


        <div className="event-container">


          {events.length === 0 ? (

            <p className="loading">

              No events found.
              Make sure FastAPI is running.

            </p>

          ) : (

            events.map((event) => (

              <div
                className="event-card"
                key={event.event_id}
              >

                <h3>
                  {event.name}
                </h3>


                <p>
                  📅 {event.event_date}
                </p>


                <p>
                  📍 {event.venue}
                </p>


                <p>
                  👥 Capacity: {event.capacity}
                </p>


                <h3 className="price">

                  ₹{event.ticket_price}

                </h3>


                <button

                  className="book-button"

                  onClick={() =>
                    selectEvent(event)
                  }

                >

                  Book Now

                </button>

              </div>

            ))

          )}

        </div>

      </section>



      {/* BOOKING */}

      <section
        id="booking"
        className="booking-section"
      >

        <h2>
          Book Your Ticket
        </h2>


        {!selectedEvent ? (

          <p>
            Select an event above to book your ticket.
          </p>

        ) : (

          <>


            <p className="selected">

              Selected Event:

              <strong>
                {" "}
                {selectedEvent.name}
              </strong>

            </p>



            <form
              onSubmit={bookTicket}
              className="booking-form"
            >


              <input

                type="text"

                placeholder="Full Name"

                value={name}

                onChange={(e) =>
                  setName(e.target.value)
                }

                required

              />



              <input

                type="email"

                placeholder="Email"

                value={email}

                onChange={(e) =>
                  setEmail(e.target.value)
                }

                required

              />



              <input

                type="number"

                min="1"

                max={selectedEvent.capacity}

                value={tickets}

                onChange={(e) =>
                  setTickets(e.target.value)
                }

                required

              />



              <p className="total">

                Total Amount: ₹

                {Number(selectedEvent.ticket_price) *
                  Number(tickets || 0)}

              </p>



              <button
                type="submit"
                className="confirm-button"
              >

                Confirm Booking

              </button>


            </form>



            {/* MESSAGE */}

            {message && (

              <div className="message">

                {message}

              </div>

            )}



            {/* QR TICKETS */}

            {ticketCodes.length > 0 && (

              <div className="qr-section">

                <h3>
                  Your Tickets
                </h3>


                <div className="tickets-container">

                  {ticketCodes.map(
                    (code, index) => (

                      <div
                        className="ticket-item"
                        key={code}
                      >

                        <h4>
                          Ticket {index + 1}
                        </h4>


                        <img

                          src={`${API}/tickets/${code}/qr`}

                          alt={`QR Code for Ticket ${index + 1}`}

                          className="qr-code"

                        />


                        <p>

                          Ticket Code:

                          <strong>
                            {" "}
                            {code}
                          </strong>

                        </p>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}

          </>

        )}

      </section>


    </div>

  );

}

export default Booking;