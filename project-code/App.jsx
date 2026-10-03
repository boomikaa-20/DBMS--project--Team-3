// import { useEffect, useState } from "react";
// import "./App.css";

// const API = "http://localhost:8000";

// function App() {
//   // =====================================================
//   // EVENTS + BOOKING
//   // =====================================================

//   const [events, setEvents] = useState([]);
//   const [selectedEvent, setSelectedEvent] = useState(null);

//   const [ticketCodes, setTicketCodes] = useState([]);

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [tickets, setTickets] = useState(1);

//   const [message, setMessage] = useState("");

//   // =====================================================
//   // LOGIN / SIGNUP
//   // =====================================================

//   const [showLogin, setShowLogin] = useState(false);
//   const [showSignup, setShowSignup] = useState(false);

//   const [loginEmail, setLoginEmail] = useState("");
//   const [loginPassword, setLoginPassword] = useState("");

//   const [signupName, setSignupName] = useState("");
//   const [signupEmail, setSignupEmail] = useState("");
//   const [signupPassword, setSignupPassword] = useState("");

//   const [user, setUser] = useState(null);


//   // =====================================================
//   // CHECK EXISTING LOGIN
//   // =====================================================

//   useEffect(() => {
//     const savedUser = localStorage.getItem("user");

//     if (savedUser) {
//       setUser(JSON.parse(savedUser));
//     }
//   }, []);


//   // =====================================================
//   // FETCH EVENTS
//   // =====================================================

//   useEffect(() => {
//     fetch(`${API}/events`)
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("Events:", data);
//         setEvents(data.events || []);
//       })
//       .catch((error) => {
//         console.error(error);
//         setMessage("Backend is not connected.");
//       });
//   }, []);


//   // =====================================================
//   // SELECT EVENT
//   // =====================================================

//   const selectEvent = (event) => {
//     setSelectedEvent(event);
//     setMessage("");
//     setTicketCodes([]);

//     setTimeout(() => {
//       document
//         .getElementById("booking")
//         ?.scrollIntoView({ behavior: "smooth" });
//     }, 100);
//   };


//   // =====================================================
//   // SIGNUP
//   // =====================================================

//   const signupUser = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await fetch(`${API}/signup`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: signupName,
//           email: signupEmail,
//           password: signupPassword,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         setMessage(data.detail || "Signup failed.");
//         return;
//       }

//       setMessage("Signup successful! Please login.");

//       setSignupName("");
//       setSignupEmail("");
//       setSignupPassword("");

//       setShowSignup(false);
//       setShowLogin(true);

//     } catch (error) {
//       console.error(error);
//       setMessage("Cannot connect to backend.");
//     }
//   };


//   // =====================================================
//   // LOGIN
//   // =====================================================

//   const loginUser = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await fetch(`${API}/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: loginEmail,
//           password: loginPassword,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         setMessage(data.detail || "Login failed.");
//         return;
//       }

//       // Save login information
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("user", JSON.stringify(data.user));

//       setUser(data.user);

//       setMessage(`Welcome, ${data.user.name}!`);

//       setLoginEmail("");
//       setLoginPassword("");

//       setShowLogin(false);

//     } catch (error) {
//       console.error(error);
//       setMessage("Cannot connect to backend.");
//     }
//   };


//   // =====================================================
//   // LOGOUT
//   // =====================================================

//   const logoutUser = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");

//     setUser(null);
//     setMessage("Logged out successfully.");

//     setShowLogin(false);
//     setShowSignup(false);
//   };


//   // =====================================================
//   // BOOK TICKET
//   // =====================================================

//   const bookTicket = async (e) => {
//     e.preventDefault();

//     if (!selectedEvent) {
//       setMessage("Please select an event first.");
//       return;
//     }

//     try {
//       const response = await fetch(`${API}/bookings`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           event_id: selectedEvent.event_id,
//           customer_name: name,
//           email: email,
//           tickets: Number(tickets),
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         setMessage(data.detail || "Booking failed.");
//         return;
//       }

//       setMessage(
//         `Booking successful! ${data.ticket_codes.length} ticket(s) generated!`
//       );

//       setTicketCodes(data.ticket_codes);

//       setName("");
//       setEmail("");
//       setTickets(1);

//     } catch (error) {
//       console.error(error);
//       setMessage("Cannot connect to backend.");
//     }
//   };


//   // =====================================================
//   // FRONTEND
//   // =====================================================

//   return (
//     <div className="app">

//       {/* =================================================
//           NAVBAR
//       ================================================= */}

//       <nav className="navbar">

//         <div className="logo">
//           Eventify
//         </div>

//         <div className="nav-links">

//           <a href="#home">
//             Home
//           </a>

//           <a href="#events">
//             Events
//           </a>

//           <a href="#booking">
//             Booking
//           </a>

//           {!user ? (
//             <>
//               <button
//                 className="nav-button"
//                 onClick={() => {
//                   setShowLogin(true);
//                   setShowSignup(false);
//                   setMessage("");
//                 }}
//               >
//                 Login
//               </button>

//               <button
//                 className="nav-button"
//                 onClick={() => {
//                   setShowSignup(true);
//                   setShowLogin(false);
//                   setMessage("");
//                 }}
//               >
//                 Sign Up
//               </button>
//             </>
//           ) : (
//             <>
//               <span className="welcome">
//                 Hi, {user.name}
//               </span>

//               <button
//                 className="nav-button"
//                 onClick={logoutUser}
//               >
//                 Logout
//               </button>
//             </>
//           )}

//         </div>

//       </nav>


//       {/* =================================================
//           LOGIN
//       ================================================= */}

//       {showLogin && (
//         <section className="auth-section">

//           <h2>
//             Login
//           </h2>

//           <form
//             onSubmit={loginUser}
//             className="auth-form"
//           >

//             <input
//               type="email"
//               placeholder="Email"
//               value={loginEmail}
//               onChange={(e) =>
//                 setLoginEmail(e.target.value)
//               }
//               required
//             />

//             <input
//               type="password"
//               placeholder="Password"
//               value={loginPassword}
//               onChange={(e) =>
//                 setLoginPassword(e.target.value)
//               }
//               required
//             />

//             <button type="submit">
//               Login
//             </button>

//             <p>
//               Don't have an account?{" "}

//               <button
//                 type="button"
//                 onClick={() => {
//                   setShowLogin(false);
//                   setShowSignup(true);
//                   setMessage("");
//                 }}
//               >
//                 Sign Up
//               </button>
//             </p>

//           </form>

//         </section>
//       )}


//       {/* =================================================
//           SIGNUP
//       ================================================= */}

//       {showSignup && (
//         <section className="auth-section">

//           <h2>
//             Create Account
//           </h2>

//           <form
//             onSubmit={signupUser}
//             className="auth-form"
//           >

//             <input
//               type="text"
//               placeholder="Full Name"
//               value={signupName}
//               onChange={(e) =>
//                 setSignupName(e.target.value)
//               }
//               required
//             />

//             <input
//               type="email"
//               placeholder="Email"
//               value={signupEmail}
//               onChange={(e) =>
//                 setSignupEmail(e.target.value)
//               }
//               required
//             />

//             <input
//               type="password"
//               placeholder="Password"
//               value={signupPassword}
//               onChange={(e) =>
//                 setSignupPassword(e.target.value)
//               }
//               required
//             />

//             <button type="submit">
//               Create Account
//             </button>

//             <p>
//               Already have an account?{" "}

//               <button
//                 type="button"
//                 onClick={() => {
//                   setShowSignup(false);
//                   setShowLogin(true);
//                   setMessage("");
//                 }}
//               >
//                 Login
//               </button>
//             </p>

//           </form>

//         </section>
//       )}


//       {/* =================================================
//           HERO
//       ================================================= */}

//       <section
//         id="home"
//         className="hero"
//       >

//         <div>

//           <h1>
//             Event Management & Ticketing Platform
//           </h1>

//           <p>
//             Discover. Book. Experience.
//           </p>

//           <button
//             className="hero-button"
//             onClick={() =>
//               document
//                 .getElementById("events")
//                 ?.scrollIntoView({
//                   behavior: "smooth",
//                 })
//             }
//           >
//             Explore Events
//           </button>

//         </div>

//       </section>


//       {/* =================================================
//           EVENTS
//       ================================================= */}

//       <section
//         id="events"
//         className="events-section"
//       >

//         <h2>
//           Upcoming Events
//         </h2>

//         <div className="event-container">

//           {events.length === 0 ? (

//             <p className="loading">
//               No events found.
//               Make sure FastAPI is running.
//             </p>

//           ) : (

//             events.map((event) => (

//               <div
//                 className="event-card"
//                 key={event.event_id}
//               >

//                 <h3>
//                   {event.name}
//                 </h3>

//                 <p>
//                   📅 {event.event_date}
//                 </p>

//                 <p>
//                   📍 {event.venue}
//                 </p>

//                 <p>
//                   👥 Capacity: {event.capacity}
//                 </p>

//                 <h3 className="price">
//                   ₹{event.ticket_price}
//                 </h3>

//                 <button
//                   className="book-button"
//                   onClick={() =>
//                     selectEvent(event)
//                   }
//                 >
//                   Book Now
//                 </button>

//               </div>

//             ))

//           )}

//         </div>

//       </section>


//       {/* =================================================
//           BOOKING
//       ================================================= */}

//       <section
//         id="booking"
//         className="booking-section"
//       >

//         <h2>
//           Book Your Ticket
//         </h2>

//         {!selectedEvent ? (

//           <p>
//             Select an event above to book your ticket.
//           </p>

//         ) : (

//           <>

//             <p className="selected">

//               Selected Event:

//               <strong>
//                 {" "}
//                 {selectedEvent.name}
//               </strong>

//             </p>


//             <form
//               onSubmit={bookTicket}
//               className="booking-form"
//             >

//               <input
//                 type="text"
//                 placeholder="Full Name"
//                 value={name}
//                 onChange={(e) =>
//                   setName(e.target.value)
//                 }
//                 required
//               />


//               <input
//                 type="email"
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) =>
//                   setEmail(e.target.value)
//                 }
//                 required
//               />


//               <input
//                 type="number"
//                 min="1"
//                 max={selectedEvent.capacity}
//                 value={tickets}
//                 onChange={(e) =>
//                   setTickets(e.target.value)
//                 }
//                 required
//               />


//               <p className="total">

//                 Total Amount: ₹

//                 {Number(selectedEvent.ticket_price) *
//                   Number(tickets || 0)}

//               </p>


//               <button
//                 type="submit"
//                 className="confirm-button"
//               >
//                 Confirm Booking
//               </button>

//             </form>


//             {/* BOOKING MESSAGE */}

//             {message && (
//               <div className="message">
//                 {message}
//               </div>
//             )}


//             {/* =================================================
//                 QR CODES
//             ================================================= */}

//             {ticketCodes.length > 0 && (

//               <div className="qr-section">

//                 <h3>
//                   Your Tickets
//                 </h3>


//                 {ticketCodes.map(
//                   (code, index) => (

//                     <div
//                       className="ticket-item"
//                       key={code}
//                     >

//                       <h4>
//                         Ticket {index + 1}
//                       </h4>


//                       <img
//                         src={`${API}/tickets/${code}/qr`}
//                         alt={`QR Code for Ticket ${
//                           index + 1
//                         }`}
//                         className="qr-code"
//                       />


//                       <p>
//                         Ticket Code:{" "}
//                         <strong>
//                           {code}
//                         </strong>
//                       </p>

//                     </div>

//                   )
//                 )}

//               </div>

//             )}

//           </>

//         )}

//       </section>

//     </div>
//   );
// }

// export default App;
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Booking from "./pages/Booking";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login Page */}
        <Route path="/" element={<Login />} />

        {/* Signup Page */}
        <Route path="/signup" element={<Signup />} />

        {/* Events + Booking + Tickets Page */}
        <Route path="/booking" element={<Booking />} />

        {/* Any wrong URL → Login */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;