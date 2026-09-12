from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import mysql.connector
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT")),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )

def calculate_risk_score(indicators):
    total_score = sum(indicator["weight"] for indicator in indicators)
    return min(total_score, 100)   # Keep risk score within 0-100

def get_severity(risk_score):
    if risk_score >= 70:
        return "Critical"
    elif risk_score >= 50:
        return "High"
    elif risk_score >= 30:
        return "Medium"
    else:
        return "Low"

def detect_indicators(user, event, previous_events):
    indicators = []

    # Rule 1: New country
    if event["location"] != user["usual_location"]:
        indicators.append({
            "type": "new_country",
            "weight": 30,
            "description": "Login detected from a country different from the user's usual location"
        })

    # Rule 2: New device
    previous_devices = {
        previous["device"]
        for previous in previous_events
        if previous["device"]
    }

    if previous_devices and event["device"] not in previous_devices:
        indicators.append({
            "type": "new_device",
            "weight": 25,
            "description": "Login detected from an unfamiliar device"
    })

    # Rule 3: Suspected VPN
    if event["vpn_suspected"]:
        indicators.append({
            "type": "vpn_suspected",
            "weight": 10,
            "description": "Login originated from an IP address associated with possible VPN or proxy usage"
        })

    # Rule 4: Impossible travel
    if event["login_status"] == "success":
        for previous in reversed(previous_events):
            if (
                previous["login_status"] == "success"
                and previous["location"] != event["location"]
            ):
                time_difference = (
                    event["event_timestamp"]
                    - previous["event_timestamp"]
                ).total_seconds() / 3600

                if time_difference <= 2:
                    indicators.append({
                        "type": "impossible_travel",
                        "weight": 25,
                        "description": "Login locations changed between different countries within an unusually short time period"
                    })

                break


    # Rule 5: Multiple failed logins
    if event["login_status"] == "success":
        recent_failed_logins = []

        for previous in previous_events:
            if previous["login_status"] == "failed":
                time_difference = (
                    event["event_timestamp"]
                    - previous["event_timestamp"]
                ).total_seconds() / 60

                if 0 <= time_difference <= 15:
                    recent_failed_logins.append(previous)

        if len(recent_failed_logins) >= 3:
            indicators.append({
                "type": "multiple_failed_logins",
                "weight": 40,
                "description": "Multiple failed login attempts occurred within 15 minutes before a successful login"
            })
    return indicators

def generate_alert_for_event(event_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Get the event and its user
    query = """
        SELECT
            se.*,
            u.email,
            u.department,
            u.role,
            u.usual_location
        FROM security_events se
        JOIN users u
            ON se.user_id = u.user_id
        WHERE se.event_id = %s
    """

    cursor.execute(query, (event_id,))
    event = cursor.fetchone()

    if not event:
        cursor.close()
        connection.close()
        return {"error": "Event not found"}

    # Check if an alert already exists for this event
    query = """
        SELECT alert_id
        FROM alerts
        WHERE event_id = %s
    """

    cursor.execute(query, (event_id,))
    existing_alert = cursor.fetchone()

    if existing_alert:
        cursor.close()
        connection.close()

        return {
            "status": "existing",
            "alert_id": existing_alert["alert_id"],
            "event_id": event_id
        }

    # Get previous events for this user
    query = """
        SELECT *
        FROM security_events
        WHERE user_id = %s
          AND event_timestamp < %s
        ORDER BY event_timestamp ASC
    """

    cursor.execute(
        query,
        (event["user_id"], event["event_timestamp"])
    )

    previous_events = cursor.fetchall()

    user = {
        "email": event["email"],
        "department": event["department"],
        "role": event["role"],
        "usual_location": event["usual_location"]
    }

    # Run detection
    indicators = detect_indicators(
        user,
        event,
        previous_events
    )

    # Don't create an alert if nothing suspicious was detected
    if not indicators:
        cursor.close()
        connection.close()

        return {
          "status": "no_alert",
          "event_id": event_id
        }

    # Calculate risk and severity
    risk_score = calculate_risk_score(indicators)
    severity = get_severity(risk_score)

    # Create the alert
    query = """
        INSERT INTO alerts (
            user_id,
            event_id,
            risk_score,
            severity,
            status
        )
        VALUES (%s, %s, %s, %s, 'Open')
    """

    cursor.execute(
        query,
        (
            event["user_id"],
            event_id,
            risk_score,
            severity
        )
    )

    alert_id = cursor.lastrowid

    # Save detected indicators
    for indicator in indicators:
        query = """
            INSERT INTO alert_indicators (
                alert_id,
                indicator_type,
                weight,
                description
            )
            VALUES (%s, %s, %s, %s)
        """

        cursor.execute(
            query,
            (
                alert_id,
                indicator["type"],
                indicator["weight"],
                indicator["description"]
            )
        )

    connection.commit()

    cursor.close()
    connection.close()

    return {
    "status": "created",
    "alert_id": alert_id,
    "event_id": event_id,
    "risk_score": risk_score,
    "severity": severity,
    "indicators": indicators
}

@app.post("/run-detection")
def run_detection():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Get all security events
    cursor.execute("""
        SELECT event_id
        FROM security_events
        ORDER BY event_timestamp ASC
    """)

    events = cursor.fetchall()

    cursor.close()
    connection.close()

    events_checked = 0
    alerts_created = 0

    for event in events:
        result = generate_alert_for_event(event["event_id"])

        events_checked += 1

        if result.get("status") == "created":
            alerts_created += 1

    return {
        "events_checked": events_checked,
        "alerts_created": alerts_created
    }


@app.get("/health")
def health_check():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT 1;")
        cursor.fetchone()
        cursor.close()
        connection.close()

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception:
        return {
            "status": "unhealthy",
            "database": "disconnected"
        }



@app.get("/")
def read_root():
    return {
        "message": "SOC Security Analytics API is running"
    }


@app.get("/alerts")
def get_alerts():
    connection = get_db_connection()

    cursor = connection.cursor(dictionary=True)

    query = """
        SELECT
            a.alert_id AS id,
            u.email AS user,
            se.location,
            se.device,
            a.risk_score AS risk,
            a.severity,
            a.status,
            se.event_timestamp,
            ai.indicator_type,
            ai.weight,
            ai.description
        FROM alerts a
        JOIN users u
            ON a.user_id = u.user_id
        JOIN security_events se
            ON a.event_id = se.event_id
        LEFT JOIN alert_indicators ai
            ON a.alert_id = ai.alert_id
        ORDER BY a.risk_score DESC
    """

    cursor.execute(query)
    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    alerts = {}

    for row in rows:
        alert_id = row["id"]

        if alert_id not in alerts:
            alerts[alert_id] = {
                "id": row["id"],
                "user": row["user"],
                "location": row["location"],
                "device": row["device"],
                "risk": row["risk"],
                "severity": row["severity"],
                "status": row["status"],
                "event_timestamp": row["event_timestamp"],
                "indicators": []
            }

        if row["indicator_type"]:
            alerts[alert_id]["indicators"].append({
                "type": row["indicator_type"],
                "weight": row["weight"],
                "description": row["description"]
            })

    alert_list = list(alerts.values())

    for alert in alert_list:
        alert["risk"] = calculate_risk_score(alert["indicators"])
        alert["severity"] = get_severity(alert["risk"])

    return alert_list


@app.get("/alerts/{alert_id}/timeline")
def get_alert_timeline(alert_id: int):
    connection = get_db_connection()

    cursor = connection.cursor(dictionary=True)

    query = """
        SELECT
            se.event_id,
            se.event_type,
            se.event_timestamp,
            se.location,
            se.ip_address,
            se.device,
            se.login_status,
            se.vpn_suspected
        FROM security_events se
        JOIN alerts a
            ON se.user_id = a.user_id
        WHERE a.alert_id = %s
        ORDER BY se.event_timestamp ASC
    """

    cursor.execute(query, (alert_id,))

    events = cursor.fetchall()

    cursor.close()
    connection.close()

    return events

@app.patch("/alerts/{alert_id}/status")
def update_alert_status(alert_id: int, status: str):
    allowed_statuses = {"Open", "Investigating", "Resolved"}

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Allowed values: {sorted(allowed_statuses)}"
        )

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE alerts
        SET status = %s
        WHERE alert_id = %s
        """,
        (status, alert_id)
    )

    if cursor.rowcount == 0:
        cursor.close()
        connection.close()
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Alert status updated successfully",
        "alert_id": alert_id,
        "status": status
    }

@app.post("/alerts/{alert_id}/notes")
def add_alert_note(alert_id: int, note_text: str):
    connection = get_db_connection()
    cursor = connection.cursor()

    query = """
        INSERT INTO alert_notes (alert_id, note_text)
        VALUES (%s, %s)
    """

    cursor.execute(query, (alert_id, note_text))
    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Note added",
        "alert_id": alert_id,
        "note": note_text
    }

@app.get("/alerts/{alert_id}/notes")
def get_alert_notes(alert_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    query = """
        SELECT
            note_id,
            note_text,
            created_at
        FROM alert_notes
        WHERE alert_id = %s
        ORDER BY created_at DESC
    """

    cursor.execute(query, (alert_id,))
    notes = cursor.fetchall()

    cursor.close()
    connection.close()

    return notes