# SignalScope: SOC Alert Triage Dashboard

An interactive Security Operations Center (SOC) simulation tool designed to help analysts prioritize, interpret, and respond to security alerts under uncertainty using explainable, rule-based decision logic.

# Overview

Security analysts deal with high volumes of noisy alerts. The hardest part is not detection—it’s deciding what matters.

# SignalScope simulates a SOC triage workflow by:

- Ranking alerts by risk
- Explaining why an alert is risky
- Suggesting investigation actions
- Visualizing user login behavior over time
  
# Key Features
### Risk-Based Alert Prioritization

Alerts are scored using a rule-based system that evaluates behavioral security signals such as:

- New country login
- Impossible travel patterns
- New device detection
- VPN/proxy suspicion
- MFA usage anomalies

### Explainable Security Decisions

Each alert includes a transparent breakdown of:

- Contributing signals
- Weighted risk factors
- Human-readable interpretation of risk
  
### Analyst Decision Support

The system suggests recommended actions such as:

- Verifying login origin
- Checking device registration
- Reviewing IP reputation
- Investigating session anomalies
  
### Login Timeline Visualization

Displays chronological user activity:

- Login events
- Locations
- Devices used

Helps identify suspicious behavioral patterns over time.

## SOC-Style UI

Dark-themed interface inspired by real-world security dashboards (e.g., SIEM tools).

## Tech Stack
- React (Vite)
- JavaScript (ES6+)
- HTML/CSS (inline styling)
- Node.js (development environment)

## Running Project Locally
# Clone repository
git clone https://github.com/ruhani-source/SignalScope-SOC-Alert-Triage-Dashboard.git

# Navigate into project
cd SignalScope-SOC-Alert-Triage-Dashboard

# Install dependencies
npm install

# Start development server
npm run dev

Then open:

http://localhost:5173


## How to Use
- Select an alert from the left panel
- View risk score and explanation breakdown
- Review recommended analyst actions
- Inspect login timeline for behavioral anomalies

## Problem It Solves

Traditional security tools often present alerts as:

❌ high-volume, low-context signals

SignalScope improves this by:

✅ adding explainability, prioritization, and decision support
