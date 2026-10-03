from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import mysql.connector
from passlib.context import CryptContext
from jose import jwt
import qrcode
import uuid
import os


# =========================================================
# APP
# =========================================================

app = FastAPI()


# =========================================================
# QR CODE FOLDER
# =========================================================

os.makedirs("qr_codes", exist_ok=True)

app.mount(
    "/qr_codes",
    StaticFiles(directory="qr_codes"),
    name="qr_codes"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# PASSWORD HASHING
# =========================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

SECRET_KEY = "eventify_secret_key_123"
ALGORITHM = "HS256"


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Boomika20@$",
        database="event_management"
    )


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return {
        "message": "Eventify Backend is Working!"
    }


# =========================================================
# SIGNUP
# =========================================================

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str


@app.post("/signup")
def signup(user: SignupRequest):

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM users WHERE email = %s",
        (user.email,)
    )

    existing_user = cursor.fetchone()

    if existing_user:
        cursor.close()
        connection.close()

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    password_hash = pwd_context.hash(user.password)

    cursor.execute(
        """
        INSERT INTO users
        (name, email, password_hash)
        VALUES (%s, %s, %s)
        """,
        (
            user.name,
            user.email,
            password_hash
        )
    )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Signup successful!"
    }


# =========================================================
# LOGIN
# =========================================================

class LoginRequest(BaseModel):
    email: str
    password: str


@app.post("/login")
def login(user: LoginRequest):

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM users WHERE email = %s",
        (user.email,)
    )

    db_user = cursor.fetchone()

    cursor.close()
    connection.close()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not pwd_context.verify(
        user.password,
        db_user["password_hash"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = jwt.encode(
        {
            "user_id": db_user["user_id"],
            "email": db_user["email"],
            "role": db_user["role"]
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return {
        "message": "Login successful!",
        "token": token,
        "user": {
            "user_id": db_user["user_id"],
            "name": db_user["name"],
            "email": db_user["email"],
            "role": db_user["role"]
        }
    }


# =========================================================
# GET EVENTS
# =========================================================

@app.get("/events")
def get_events():

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM events"
    )

    events = cursor.fetchall()

    cursor.close()
    connection.close()

    return {
        "events": events
    }


# =========================================================
# BOOKING
# =========================================================

class Booking(BaseModel):
    event_id: int
    customer_name: str
    email: str
    tickets: int


@app.post("/bookings")
def create_booking(booking: Booking):

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    # Get event
    cursor.execute(
        "SELECT * FROM events WHERE event_id = %s",
        (booking.event_id,)
    )

    event = cursor.fetchone()

    if not event:
        cursor.close()
        connection.close()
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    # Validate tickets
    if booking.tickets <= 0:
        cursor.close()
        connection.close()
        raise HTTPException(
            status_code=400,
            detail="Invalid ticket quantity"
        )

    if booking.tickets > event["capacity"]:
        cursor.close()
        connection.close()
        raise HTTPException(
            status_code=400,
            detail="Not enough tickets available"
        )

    # Calculate total
    total_amount = event["ticket_price"] * booking.tickets

    # Insert booking
    cursor.execute(
        """
        INSERT INTO bookings
        (event_id, customer_name, email, tickets)
        VALUES (%s, %s, %s, %s)
        """,
        (
            booking.event_id,
            booking.customer_name,
            booking.email,
            booking.tickets
        )
    )

    booking_id = cursor.lastrowid

    # Generate one ticket for EACH ticket booked
    ticket_codes = []

    for i in range(booking.tickets):

        ticket_code = "EVT-" + str(uuid.uuid4())[:8].upper()

        cursor.execute(
            """
            INSERT INTO tickets
            (booking_id, ticket_code)
            VALUES (%s, %s)
            """,
            (
                booking_id,
                ticket_code
            )
        )

        ticket_codes.append(ticket_code)

    # Save payment details
    cursor.execute(
        """
        INSERT INTO payments
        (booking_id, amount, payment_status)
        VALUES (%s, %s, %s)
        """,
        (
            booking_id,
            total_amount,
            "SUCCESS"
        )
    )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Booking successful!",
        "booking_id": booking_id,
        "ticket_codes": ticket_codes,
        "total_amount": total_amount,
        "payment_status": "SUCCESS"
    }

# =========================================================
# GENERATE QR CODE
# =========================================================

@app.get("/tickets/{ticket_code}/qr")
def generate_qr(ticket_code: str):

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT *
        FROM tickets
        WHERE ticket_code = %s
        """,
        (ticket_code,)
    )

    ticket = cursor.fetchone()

    cursor.close()
    connection.close()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    os.makedirs("qr_codes", exist_ok=True)

    file_path = f"qr_codes/{ticket_code}.png"

    qr = qrcode.make(ticket_code)
    qr.save(file_path)

    return FileResponse(
        file_path,
        media_type="image/png"
    )

# =========================================================
# VERIFY TICKET
# =========================================================

@app.get("/tickets/verify/{ticket_code}")
def verify_ticket(ticket_code: str):

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT *
        FROM tickets
        WHERE ticket_code = %s
        """,
        (ticket_code,)
    )

    ticket = cursor.fetchone()

    cursor.close()
    connection.close()

    if not ticket:

        return {
            "valid": False,
            "message": "Invalid ticket"
        }

    if ticket["checked_in"]:

        return {
            "valid": False,
            "message": "Ticket already used"
        }

    return {
        "valid": True,
        "message": "Valid ticket",
        "ticket_code": ticket_code,
        "checked_in": False
    }


# =========================================================
# CHECK-IN TICKET
# =========================================================

@app.put("/tickets/checkin/{ticket_code}")
def checkin_ticket(ticket_code: str):

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT *
        FROM tickets
        WHERE ticket_code = %s
        """,
        (ticket_code,)
    )

    ticket = cursor.fetchone()

    if not ticket:

        cursor.close()
        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    if ticket["checked_in"]:

        cursor.close()
        connection.close()

        raise HTTPException(
            status_code=400,
            detail="Ticket already used"
        )

    cursor.execute(
        """
        UPDATE tickets
        SET checked_in = TRUE
        WHERE ticket_code = %s
        """,
        (ticket_code,)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Ticket checked in successfully!"
    }