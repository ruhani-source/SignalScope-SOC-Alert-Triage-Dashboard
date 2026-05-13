import { useState } from "react";
import { alerts } from "./data/alerts";

/* -----------------------------
   Explainability models
------------------------------*/
const signalWeights = {
  new_country: { label: "New country", weight: 30 },
  impossible_travel: { label: "Impossible travel", weight: 25 },
  new_device: { label: "New device", weight: 20 },
  vpn_suspected: { label: "VPN suspected", weight: 10 },
  mfa_used: { label: "MFA used", weight: -15 }
};

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

function getRiskBreakdown(signals) {
  let breakdown = [];

  for (let key in signals) {
    if (signals[key] && signalWeights[key]) {
      breakdown.push(signalWeights[key]);
    }
  }

  return breakdown;
}

function getNextActions(signals) {
  let actions = [];

  for (let key in signals) {
    if (signals[key] && actionRules[key]) {
      actions.push(actionRules[key]);
    }
  }

  return actions;
}

function getTimeline(alert) {
  return alert?.timeline || [];
}

/* -----------------------------
   Main App
------------------------------*/
function App() {
  const [selectedAlert, setSelectedAlert] = useState(null);

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
          width: "35%",
          borderRight: "1px solid #1f2937",
          padding: "12px",
          overflowY: "auto"
        }}
      >
        <h2 style={{ marginBottom: "10px" }}>Alerts</h2>

        {[...alerts]
          .sort((a, b) => b.risk - a.risk)
          .map((alert) => (
            <div
              key={alert.id}
              onClick={() => setSelectedAlert(alert)}
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
              <p>{alert.user}</p>
              <p>{alert.location}</p>

              <p
                style={{
                  color: getRiskColor(alert.risk),
                  fontWeight: "bold"
                }}
              >
                Risk Score: {alert.risk}
              </p>
            </div>
          ))}
      </div>

      {/* RIGHT PANEL */}
      <div
        style={{
          width: "65%",
          padding: "20px",
          overflowY: "auto"
        }}
      >
        <h2>Alert Details</h2>

        {!selectedAlert ? (
          <p>Select an alert to view details</p>
        ) : (
          <div>
            <p>User: {selectedAlert.user}</p>
            <p>Location: {selectedAlert.location}</p>
            <p>Device: {selectedAlert.device}</p>

            <p
              style={{
                color: getRiskColor(selectedAlert.risk),
                fontWeight: "bold"
              }}
            >
              Risk Score: {selectedAlert.risk}
            </p>

            {/* Risk Breakdown */}
            <h3 style={{ marginTop: "20px", color: "#93c5fd" }}>
              Why this alert is risky
            </h3>

            <ul>
              {getRiskBreakdown(selectedAlert.signals).map((item, i) => (
                <li key={i}>
                  +{item.weight} {item.label}
                </li>
              ))}
            </ul>

            {/* Actions */}
            <h3 style={{ marginTop: "20px", color: "#93c5fd" }}>
              Recommended Actions
            </h3>

            <ul>
              {getNextActions(selectedAlert.signals).map((action, i) => (
                <li key={i}>➡ {action}</li>
              ))}
            </ul>

            {/* Timeline */}
            <h3 style={{ marginTop: "20px", color: "#93c5fd" }}>
              Login Timeline
            </h3>

            {getTimeline(selectedAlert).length > 0 ? (
              <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                {getTimeline(selectedAlert).map((item, i) => (
                  <li
                    key={i}
                    style={{
                      padding: "8px",
                      marginBottom: "6px",
                      background: "#111827",
                      borderRadius: "8px",
                      border: "1px solid #1f2937"
                    }}
                  >
                    <strong>{item.time}</strong> → {item.event} from{" "}
                    {item.location} ({item.device})
                  </li>
                ))}
              </ul>
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