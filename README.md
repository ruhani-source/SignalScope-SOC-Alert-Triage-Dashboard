# SignalScope: SOC Alert Triage Dashboard

The SOC Security Analytics Dashboard simulates a Security Operations Center (SOC) workflow where security events are analyzed to identify potentially suspicious activity.The application processes login events, detects security indicators, calculates a risk score, assigns a severity level, and presents the results through an interactive analyst dashboard.

## Features

- Rule-based security event detection
  - New country
  - New device
  - Suspected VPN/proxy usage
  - Impossible travel
  - Multiple failed login attempts

- Explainable risk scoring
  - Each detected indicator contributes a weighted score.
  - Analysts can see which indicators contributed to an alert.

- Alert prioritization
  - Alerts are categorized as Low, Medium, High, or Critical.
  - Alerts are sorted by risk score.

- Alert investigation
  - Risk breakdown
  - Recommended investigation actions
  - Login timeline
  - Analyst notes

- Alert workflow
  - Open
  - Investigating
  - Resolved

- Interactive dashboard
  - Alert statistics
  - Severity distribution
  - Search by user
  - Severity filtering
  - Status filtering

 ### Application Architecture

React Frontend
      │
      │ REST API
      ▼
FastAPI Backend
      │
      │ SQL
      ▼
MySQL Database


## Detection workflow

Security Events
      ↓
Detection Engine
      ↓
Security Indicators
      ↓
Risk Score
      ↓
Severity
      ↓
Alert
      ↓
Analyst Investigation

### Problem It Solves

Security analysts deal with high volumes of noisy alerts. The hardest part is not detection, it’s deciding what matters.
Traditional security tools often present alerts as: high-volume, low-context signals

SignalScope improves this by: adding explainability, prioritization, and decision support

#### Note
This project is a simulation and uses mock security data for demonstration purposes.
