import { useEffect, useState } from "react";

/* -----------------------------
   Recommended action rules
------------------------------*/


const actionRules = {
  new_country: "Verify login origin with user",
  impossible_travel: "Check for VPN or session hijack",
  new_device: "Confirm device registration",
  vpn_suspected: "Review IP reputation / proxy detection",
  mfa_used: "Check MFA logs for anomalies"
};

/* -----------------------------
   Helper functions
------------------------------*/
function getRiskColor(risk) {
  if (risk >= 70) return "#ef4444"; // red
  if (risk >= 40) return "#f59e0b"; // orange
  return "#22c55e"; // green
}


function getNextActions(indicators) {
  let actions = [];

  for (const indicator of indicators || []) {
    if (actionRules[indicator.type]) {
      actions.push(actionRules[indicator.type]);
    }
  }

  return actions;
}


/* -----------------------------
   Main App
------------------------------*/
function App() {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState([]);
  const totalAlerts = alerts.length;

  const openAlerts = alerts.filter(
    (alert) => alert.status === "Open"
  ).length;

  const investigatingAlerts = alerts.filter(
    (alert) => alert.status === "Investigating"
  ).length;

  const highRiskAlerts = alerts.filter(
    (alert) =>
      alert.severity === "High" ||
      alert.severity === "Critical"
  ).length;

    const criticalAlerts = alerts.filter(
    (alert) => alert.severity === "Critical"
  ).length;

  const highAlerts = alerts.filter(
    (alert) => alert.severity === "High"
  ).length;

  const mediumAlerts = alerts.filter(
    (alert) => alert.severity === "Medium"
  ).length;

  const lowAlerts = alerts.filter(
    (alert) => alert.severity === "Low"
  ).length;

  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
  fetch("http://127.0.0.1:8000/alerts")
    .then((response) => response.json())
    .then((data) => {
      setAlerts(data);
    })
    .catch((error) => {
      console.error("Error fetching alerts:", error);
    });
 }, []);

 function loadTimeline(alertId) {
  fetch(`http://127.0.0.1:8000/alerts/${alertId}/timeline`)
    .then((response) => response.json())
    .then((data) => {
      setTimeline(data);
    })
    .catch((error) => {
      console.error("Error fetching timeline:", error);
      setTimeline([]);
    });
}

function loadNotes(alertId) {
  fetch(`http://127.0.0.1:8000/alerts/${alertId}/notes`)
    .then((response) => response.json())
    .then((data) => {
      setNotes(data);
    })
    .catch((error) => {
      console.error("Error fetching notes:", error);
      setNotes([]);
    });
}

async function runDetection() {
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/run-detection",
      {
        method: "POST"
      }
    );

    if (!response.ok) {
      throw new Error("Failed to run detection");
    }

    const result = await response.json();

    // Refresh alerts after detection
    const alertsResponse = await fetch(
      "http://127.0.0.1:8000/alerts"
    );

    const updatedAlerts = await alertsResponse.json();

    setAlerts(updatedAlerts);

    alert(
      `Detection complete!\n\n` +
      `Events checked: ${result.events_checked}\n` +
      `New alerts: ${result.alerts_created}`
    );
  } catch (error) {
    console.error("Error running detection:", error);
  }
}

async function updateStatus(alertId, newStatus) {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/alerts/${alertId}/status?status=${newStatus}`,
      {
        method: "PATCH"
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update alert status");
    }

    setAlerts((currentAlerts) =>
      currentAlerts.map((alert) =>
        alert.id === alertId
          ? { ...alert, status: newStatus }
          : alert
      )
    );

    setSelectedAlert((currentAlert) =>
      currentAlert
        ? { ...currentAlert, status: newStatus }
        : currentAlert
    );
  } catch (error) {
    console.error("Error updating status:", error);
  }
}

async function saveNote() {
  if (!selectedAlert || !noteText.trim()) {
    return;
  }

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/alerts/${selectedAlert.id}/notes?note_text=${encodeURIComponent(noteText)}`,
      {
        method: "POST"
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save note");
    }

    setNoteText("");
    loadNotes(selectedAlert.id);

    alert("Note saved successfully");
  } catch (error) {
    console.error("Error saving note:", error);
  }
}

const filteredAlerts = alerts.filter((alert) => {
  const matchesSearch = alert.user
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  const matchesSeverity =
    severityFilter === "All" ||
    alert.severity === severityFilter;

  const matchesStatus =
    statusFilter === "All" ||
    alert.status === statusFilter;

  return matchesSearch && matchesSeverity && matchesStatus;
});

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "Inter, Arial",
        background: "#0b1220",
        color: "#e5e7eb"
      }}
    >
      {/* LEFT PANEL */}
      <div
        style={{
          width: "40%",
          borderRight: "1px solid #1f2937",
          padding: "12px",
          overflowY: "auto"
        }}
      >
        <div style={{ marginBottom: "18px" }}>
  <h2
    style={{
      margin: 0,
      fontSize: "24px",
      fontWeight: "800",
      letterSpacing: "1px",
      textTransform: "uppercase",
      color: "#e5e7eb"
    }}
  >
    <span style={{ color: "#38bdf8" }}>//</span> Alert Monitor
  </h2>

  <div
    style={{
      marginTop: "6px",
      width: "250px",
      height: "3px",
      background: "#38bdf8",
      borderRadius: "2px",
      boxShadow: "0 0 8px rgba(56, 189, 248, 0.6)"
    }}
  />
</div>
        
        <button
  onClick={runDetection}
  style={{
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: "600"
  }}
>
  Run Detection
</button>
<div style={{ marginBottom: "18px" }}></div>


          <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          marginBottom: "15px"
        }}
      >
        <div
          style={{
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: "8px",
            padding: "10px"
          }}
        >

          <div style={{ fontSize: "12px", color: "#9ca3af" }}>
            Total Alerts
          </div>
          <div style={{ fontSize: "22px", fontWeight: "bold" }}>
            {totalAlerts}
          </div>
        </div>

        <div
          style={{
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: "8px",
            padding: "10px"
          }}
        >
          <div style={{ fontSize: "12px", color: "#9ca3af" }}>
            Open
          </div>
          <div style={{ fontSize: "22px", fontWeight: "bold" }}>
            {openAlerts}
          </div>
        </div>

        <div
          style={{
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: "8px",
            padding: "10px"
          }}
        >
          <div style={{ fontSize: "12px", color: "#9ca3af" }}>
            Investigating
          </div>
          <div style={{ fontSize: "22px", fontWeight: "bold" }}>
            {investigatingAlerts}
          </div>
        </div>

        <div
          style={{
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: "8px",
            padding: "10px"
          }}
        >
          <div style={{ fontSize: "12px", color: "#9ca3af" }}>
            High / Critical
          </div>
          <div style={{ fontSize: "22px", fontWeight: "bold" }}>
            {highRiskAlerts}
          </div>
        </div>
      </div>

      <div
  style={{
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "15px"
  }}
>
  <div
    style={{
      fontSize: "13px",
      fontWeight: "bold",
      marginBottom: "12px"
    }}
  >

    Severity Distribution
  </div>

  {[
    { label: "Critical", count: criticalAlerts },
    { label: "High", count: highAlerts },
    { label: "Medium", count: mediumAlerts },
    { label: "Low", count: lowAlerts }
  ].map((severity) => (
    <div key={severity.label} style={{ marginBottom: "8px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "12px",
          marginBottom: "3px"
        }}
      >
        <span>{severity.label}</span>
        <span>{severity.count}</span>
      </div>

      <div
        style={{
          height: "6px",
          background: "#1f2937",
          borderRadius: "4px",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${totalAlerts > 0
              ? (severity.count / totalAlerts) * 100
              : 0}%`,
            background: getRiskColor(
              severity.label === "Critical"
                ? 85
                : severity.label === "High"
                ? 65
                : severity.label === "Medium"
                ? 40
                : 20
            )
          }}
        />
      </div>
    </div>
  ))}
</div>

                  <input
            type="text"
            placeholder="Search by user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px",
              marginBottom: "12px",
              background: "#111827",
              color: "#e5e7eb",
              border: "1px solid #374151",
              borderRadius: "8px",
              outline: "none"
            }}
          />

                  <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px",
            marginBottom: "12px",
            background: "#111827",
            color: "#e5e7eb",
            border: "1px solid #374151",
            borderRadius: "8px",
            outline: "none"
          }}
        >
          <option value="All">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>


            <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "10px",
        marginBottom: "12px",
        background: "#111827",
        color: "#e5e7eb",
        border: "1px solid #374151",
        borderRadius: "8px",
        outline: "none"
      }}
    >
      <option value="All">All Statuses</option>
      <option value="Open">Open</option>
      <option value="Investigating">Investigating</option>
      <option value="Resolved">Resolved</option>
    </select>


        {[...filteredAlerts]
          .sort((a, b) => b.risk - a.risk)
          .map((alert) => (

            <div
              key={alert.id}
              onClick={() => {
                 setSelectedAlert(alert);
                 loadTimeline(alert.id);
                 loadNotes(alert.id);
                  }}
              style={{
                cursor: "pointer",
                border: "1px solid #1f2937",
                marginBottom: "10px",
                padding: "10px",
                borderRadius: "10px",
                background:
                  selectedAlert?.id === alert.id ? "#1f2a44" : "#111827"
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
              {alert.user}
            </div>

            <div style={{ color: "#9ca3af", marginBottom: "8px" }}>
              📍 {alert.location}
            </div>

            <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
              <span
                style={{
                  padding: "3px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  background:
                    alert.severity === "Critical"
                      ? "#7f1d1d"
                      : alert.severity === "High"
                      ? "#9a3412"
                      : "#92400e"
                }}
              >
                {alert.severity}
              </span>

              <span
                style={{
                  padding: "3px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  background: "#374151"
                }}
              >
                {alert.status}
              </span>
            </div>

            <div
              style={{
                color: getRiskColor(alert.risk),
                fontWeight: "bold"
              }}
            >
              Risk Score: {alert.risk}
            </div>

            <div
              style={{
                marginTop: "5px",
                fontSize: "12px",
                color: "#6b7280"
              }}
            >
              {new Date(alert.event_timestamp).toLocaleString()}
            </div>
            </div>
          ))}
      </div>

      {/* RIGHT PANEL */}
      <div
        style={{
          width: "60%",
          padding: "20px",
          overflowY: "auto"
        }}
      >
   
      <div style={{ marginBottom: "18px" }}>
  <h2
    style={{
      margin: 0,
      fontSize: "24px",
      fontWeight: "800",
      letterSpacing: "1px",
      textTransform: "uppercase",
      color: "#e5e7eb"
    }}
  >
    <span style={{ color: "#38bdf8" }}>//</span> Alert Investigation
  </h2>

  <div
    style={{
      marginTop: "6px",
      width: "330px",
      height: "3px",
      background: "#38bdf8",
      borderRadius: "2px",
      boxShadow: "0 0 8px rgba(56, 189, 248, 0.6)"
    }}
  />
</div>
        {!selectedAlert ? (
          <p>Select an alert to view details</p>
        ) : (
          <div>
            <p>User: {selectedAlert.user}</p>
            <p>Location: {selectedAlert.location}</p>
            <p>Device: {selectedAlert.device}</p>

            <div style={{ marginTop: "20px" }}>
  <h3>Risk Breakdown</h3>

  {selectedAlert.indicators.map((indicator) => (
    <div
      key={indicator.type}
      style={{
        background: "#111827",
        border: "1px solid #374151",
        borderRadius: "8px",
        padding: "12px",
        marginBottom: "10px"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <strong>{indicator.type.replaceAll("_", " ")}</strong>

        <span
          style={{
            color: getRiskColor(indicator.weight),
            fontWeight: "bold"
          }}
        >
          +{indicator.weight}
        </span>
      </div>

      <p
        style={{
          color: "#9ca3af",
          margin: "6px 0 0",
          fontSize: "14px"
        }}
      >
        {indicator.description}
      </p>
    </div>
  ))}
</div>



<p
  style={{
    color: getRiskColor(selectedAlert.risk),
    fontWeight: "bold"
  }}
>
  Risk Score: {selectedAlert.risk}
</p>

<div style={{ marginTop: "10px" }}>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "6px"
    }}
  >
    <strong>Risk Level</strong>
    <strong>{selectedAlert.risk}/100</strong>
  </div>

  <div
    style={{
      width: "100%",
      height: "10px",
      background: "#374151",
      borderRadius: "5px",
      overflow: "hidden"
    }}
  >
    <div
      style={{
        width: `${selectedAlert.risk}%`,
        height: "100%",
        background: getRiskColor(selectedAlert.risk),
        borderRadius: "5px",
        transition: "width 0.3s ease"
      }}
    />
  </div>
</div>

<div style={{ marginTop: "20px" }}>
  <label style={{ fontWeight: "bold", marginRight: "10px" }}>
    Status:
  </label>

  <select
    value={selectedAlert.status}
    onChange={(e) => updateStatus(selectedAlert.id, e.target.value)}
    style={{
      padding: "8px 12px",
      borderRadius: "6px",
      background: "#374151",
      color: "white",
      border: "1px solid #4b5563",
      cursor: "pointer"
    }}
  >
    <option value="Open">Open</option>
    <option value="Investigating">Investigating</option>
    <option value="Resolved">Resolved</option>
  </select>
</div>



<div style={{ marginTop: "20px" }}>
  <h3 style={{ color: "#93c5fd", marginBottom: "10px" }}>
    Recommended Actions
  </h3>

  {getNextActions(selectedAlert.indicators).length > 0 ? (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {getNextActions(selectedAlert.indicators).map((action, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            padding: "12px",
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: "8px"
          }}
        >
          <div
            style={{
              minWidth: "26px",
              height: "26px",
              borderRadius: "50%",
              background: "#1e3a8a",
              color: "#bfdbfe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "13px"
            }}
          >
            {index + 1}
          </div>

          <div>
            <div
              style={{
                fontWeight: "100",
                color: "#e5e7eb97",
                marginBottom: "3px"
              }}
            >
              {action}
            </div>

          </div>
        </div>
      ))}
    </div>
  ) : (
    <p style={{ color: "#9ca3af" }}>
      No specific actions recommended for this alert.
    </p>
  )}
</div>

{/* Analyst Notes */}
<h3 style={{ marginTop: "20px", color: "#93c5fd" }}>
  Analyst Notes
</h3>

<textarea
  value={noteText}
  onChange={(event) => setNoteText(event.target.value)}
  placeholder="Enter investigation notes..."
  rows={4}
  style={{
    width: "100%",
    boxSizing: "border-box",
    background: "#111827",
    color: "#e5e7eb",
    border: "1px solid #374151",
    borderRadius: "8px",
    padding: "10px",
    resize: "vertical",
    fontFamily: "inherit"
  }}
/>

<button
  onClick={saveNote}
  style={{
    marginTop: "8px",
    padding: "8px 14px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  }}
>
  Save Note
</button>

{notes.length > 0 && (
  <div style={{ marginTop: "12px" }}>
    <div
      style={{
        fontSize: "13px",
        fontWeight: "bold",
        marginBottom: "8px"
      }}
    >
      Previous Notes
    </div>

    {notes.map((note) => (
      <div
        key={note.note_id}
        style={{
          background: "#111827",
          border: "1px solid #1f2937",
          borderRadius: "8px",
          padding: "10px",
          marginBottom: "8px"
        }}
      >
        <div>{note.note_text}</div>

        <div
          style={{
            marginTop: "5px",
            fontSize: "11px",
            color: "#6b7280"
          }}
        >
          {new Date(note.created_at).toLocaleString()}
        </div>
      </div>
    ))}
  </div>
)}

{/* Login Timeline */}
<h3 style={{ marginTop: "20px", color: "#93c5fd" }}>
  Login Timeline
</h3>

{timeline.length > 0 ? (
  <div style={{ marginTop: "10px" }}>
    {timeline.map((event) => {
      const isAlertEvent =
        event.event_id === selectedAlert?.event_id;

      return (
        <div
          key={event.event_id}
          style={{
            background: isAlertEvent ? "#1f2937" : "#111827",
            border: isAlertEvent
              ? "1px solid #ef4444"
              : "1px solid #374151",
            borderRadius: "8px",
            padding: "14px",
            marginBottom: "10px"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <strong>
              {event.event_type.toUpperCase()}
            </strong>

            {isAlertEvent && (
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#f87171"
                }}
              >
                ALERT EVENT
              </span>
            )}
          </div>

          <p style={{ margin: "8px 0" }}>
            <strong>Time:</strong>{" "}
            {new Date(event.event_timestamp).toLocaleString()}
          </p>

          <p style={{ margin: "6px 0" }}>
            <strong>Location:</strong>{" "}
            {event.location}
          </p>

          <p style={{ margin: "6px 0" }}>
            <strong>IP Address:</strong>{" "}
            {event.ip_address}
          </p>

          <p style={{ margin: "6px 0" }}>
            <strong>Device:</strong>{" "}
            {event.device}
          </p>

          <p style={{ margin: "6px 0" }}>
            <strong>Login Status:</strong>{" "}
            {event.login_status}
          </p>

          {Boolean(event.vpn_suspected) && (
            <p
              style={{
                margin: "6px 0",
                color: "#f59e0b",
                fontWeight: "bold"
              }}
            >
              ⚠ VPN suspected
            </p>
          )}
        </div>
      );
    })}
  </div>
) : (
  <p>No timeline available</p>
)}

          </div>
        )}
      </div>
    </div>
  );
}

export default App;