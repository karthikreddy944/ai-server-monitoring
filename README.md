# SentinelAI

AI-Powered Intelligent System Monitoring & Risk Analysis Platform

An AI-powered system monitoring application that collects real-time Windows system metrics, analyzes resource usage, detects potential risks, predicts threshold breaches, and generates AI-based explanations and recommendations.

The system combines **Windows Exporter, Prometheus, FastAPI, React, and an LLM service** to provide a complete monitoring and AI-insight workflow.

---

## 📌 Overview

The AI Monitoring System is designed to monitor the health and performance of a Windows machine in real time.

It continuously collects system information such as:

- CPU usage
- RAM usage
- Disk usage
- System performance metrics
- Running processes
- Historical resource usage
- Resource trends

The collected metrics are processed by the backend and exposed through APIs to the React frontend.

The system also includes an AI-powered analysis layer that can:

- Identify resource usage risks
- Determine severity
- Analyze resource trends
- Estimate time to reach critical thresholds
- Generate explanations for detected issues
- Provide recommendations for the user

---

## 🏗️ System Architecture

```
                    Windows Machine
                          │
                          ▼
                 ┌─────────────────┐
                 │ Windows Exporter│
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │    Prometheus   │
                 │ Metrics Storage │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │     FastAPI     │
                 │     Backend     │
                 └────────┬────────┘
                          │
             ┌────────────┼─────────────┐
             │            │             │
             ▼            ▼             ▼
        Metrics       Processes      Trends
             │            │             │
             └────────────┼─────────────┘
                          │
                          ▼
                   Risk Detection
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
         Severity       Risk         Trend
                          │
                          ▼
                Time-to-Threshold
                          │
                          ▼
                   AI / LLM Layer
                          │
                          ▼
              AI Explanation & Advice
                          │
                          ▼
                 React Frontend
                          │
                          ▼
                Monitoring Dashboard
```

---

## 🔄 Complete Monitoring Workflow

```
Windows System
      │
      ▼
Windows Exporter
      │
      ▼
Prometheus
      │
      ▼
FastAPI Backend
      │
      ├── Metrics API
      ├── Processes API
      ├── Trends API
      ├── Risk API
      └── LLM API
              │
              ▼
        Risk Detection
              │
              ▼
     Severity / Risk / Trend
              │
              ▼
      Time-to-Threshold
              │
              ▼
        LLM Analysis
              │
              ▼
      Explanation + Recommendation
              │
              ▼
        React Frontend
              │
              ▼
        User Dashboard
```

---

## 🚀 Main Features

### 1. Real-Time System Monitoring

The application monitors system resources continuously.

Supported metrics include:

- CPU
- RAM
- Disk
- Resource utilization
- System performance

The dashboard displays the current state of the system and historical resource information.

### 2. Prometheus Monitoring

Prometheus is used as the metrics collection and monitoring layer.

```
Windows Exporter
       │
       ▼
   Prometheus
       │
       ▼
FastAPI Backend
```

Prometheus provides the monitoring data required by the backend for analysis.

### 3. Windows Exporter

Windows Exporter collects Windows system performance metrics and exposes them in a format that Prometheus can scrape.

It acts as the bridge between the Windows operating system and Prometheus.

```
Windows OS
    │
    ▼
Windows Exporter
    │
    ▼
Prometheus
```

---

## 🧠 AI-Powered Monitoring

The system adds an AI layer on top of traditional monitoring.

Instead of only displaying:

```
CPU: 87%
RAM: 82%
Disk: 91%
```

the system can analyze the condition and provide meaningful information such as:

```
Risk Level: High
Severity: Critical
Trend: Increasing
Time to Threshold: Estimated
```

The LLM can then generate:

**Explanation:**
> CPU usage is increasing and approaching the configured threshold.

**Recommendation:**
> Check high CPU-consuming processes and consider closing unnecessary applications.

---

## ⚠️ Risk Detection

The backend analyzes monitored resources and determines their risk condition.

The risk analysis considers values such as:

- Current usage
- Threshold
- Severity
- Risk level
- Trend
- Time to threshold

**Example — Resource: CPU**

| Field | Value |
|---|---|
| Current Usage | 86% |
| Threshold | 90% |
| Severity | High |
| Risk Level | High |
| Trend | Increasing |
| Time to Threshold | Estimated |

---

## 📊 Severity

Severity represents how serious the current resource condition is.

Example classification:

```
Low → Medium → High → Critical
```

Higher severity indicates that the monitored resource requires more attention.

---

## 📈 Trend Analysis

The system analyzes historical metrics to determine whether resource usage is:

- Increasing
- Decreasing
- Stable

For example:

```
CPU

50% ──────╮
          │
60% ──────┤
          │
70% ──────┤
          ╰────── 80%

Trend: Increasing
```

Trend information helps the system determine whether a resource may become problematic in the near future.

---

## ⏱️ Time-to-Threshold

One of the important features of the monitoring system is estimating how long it may take for a resource to reach its configured threshold.

**Example:**

```
Current CPU: 78%
Threshold: 90%

Time to Threshold: 12 minutes
```

Possible states include:

- Estimated
- Already Reached
- Not Applicable
- Currently Unreliable

This allows the monitoring system to provide predictive information rather than only showing the current resource value.

---

## 🤖 LLM / AI Explanation

The LLM layer converts monitoring information into human-readable explanations.

The AI can explain:

- Why a resource is considered risky
- What the current trend means
- What may happen if the trend continues
- What action the user can take

**Example**

| Field | Value |
|---|---|
| Resource | RAM |
| Risk | High |
| Trend | Increasing |

**AI Explanation:**
> Memory utilization is increasing and may approach the configured threshold if the current trend continues.

**Recommendation:**
> Review memory-intensive processes and applications.

---

## 🖥️ Frontend

The frontend is built using React.

The frontend provides the user interface for:

- System monitoring
- Resource usage
- AI insights
- Risk information
- Trend information
- Settings
- AI explanations

---

## 🔙 Backend

The backend is built using FastAPI.

The backend is responsible for:

- API endpoints
- Prometheus communication
- Resource processing
- Process monitoring
- Trend analysis
- Risk detection
- Time-to-threshold calculation
- LLM integration

---

## 📁 Project Structure

```
ai-server-monitoring/
│
├── backend/
│   │
│   └── app/
│       │
│       ├── api/
│       │   └── routes/
│       │       ├── llm.py
│       │       ├── processes.py
│       │       ├── risk.py
│       │       └── trends.py
│       │
│       ├── core/
│       │   └── config.py
│       │
│       ├── schemas/
│       │   ├── llm.py
│       │   ├── processes.py
│       │   ├── risk.py
│       │   └── trends.py
│       │
│       ├── services/
│       │   ├── llm_service.py
│       │   ├── process_monitor.py
│       │   ├── risk.py
│       │   └── trends.py
│       │
│       └── main.py
│
├── frontend/
│   │
│   └── src/
│       ├── api/
│       │   └── client.js
│       │
│       ├── components/
│       │   └── ResourceUsage.jsx
│       │
│       ├── hooks/
│       │   ├── useExplainInsight.js
│       │   └── useRisk.js
│       │
│       ├── pages/
│       │   ├── AIInsights.jsx
│       │   ├── Settings.jsx
│       │   └── Settings.css
│       │
│       └── utils/
│           └── formatDuration.js
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🛠️ Technology Stack

**Frontend**
- React
- JavaScript
- Vite
- HTML
- CSS

**Backend**
- Python
- FastAPI
- Uvicorn

**Monitoring**
- Prometheus
- Windows Exporter

**AI**
- LLM integration
- Ollama / configured LLM provider

**Development**
- Git
- GitHub
- Docker
- Docker Compose

---

## 🔌 Backend API Architecture

The backend exposes different APIs for different monitoring responsibilities.

| API | Endpoint | Description |
|---|---|---|
| LLM | `/api/insights/explain` | Used to generate AI explanations for monitored metrics |
| Risk | `/api/risk` | Provides risk information for monitored resources |
| Processes | `/api/processes` | Provides information about running processes |
| Trends | `/api/trends` | Provides resource trend information |

---

## 🐳 Docker

Docker is used to simplify the deployment of monitoring services.

The monitoring stack can include:

- Prometheus
- Other monitoring services

Docker Compose can be used to start and stop the required services.

**Start:**
```bash
docker compose up -d
```

**Stop:**
```bash
docker compose down
```

**Check running containers:**
```bash
docker ps
```

---

## ▶️ Running the Backend

Navigate to the project directory:

```bash
cd "C:\AI monitoring project\ai-server-monitoring"
```

Activate the Python virtual environment:

```bash
.\backend\venv\Scripts\Activate.ps1
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload --app-dir backend
```

The backend will run on:

```
http://127.0.0.1:8000
```

---

## ▶️ Running the Frontend

Open another PowerShell terminal.

Navigate to:

```bash
cd "C:\AI monitoring project\ai-server-monitoring\frontend"
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available through the URL shown by Vite in the terminal.

---

## 🔍 Backend API Documentation

When the FastAPI backend is running, the interactive API documentation is available at:

```
http://127.0.0.1:8000/docs
```

This can be used to test and inspect the available API endpoints.

---

## 🧪 Frontend Build

To create a production build:

```bash
cd frontend
npm run build
```

To check the frontend code with ESLint:

```bash
npx eslint src
```

---

## 🔐 Configuration

Configuration is managed through the backend configuration system.

Sensitive values such as API keys and environment-specific settings should not be committed to GitHub.

Use environment variables where appropriate.

Example:

```
.env
```

The `.env` file should remain excluded from Git.

---

## 📊 Monitoring Flow

The complete data flow can be represented as:

```
             WINDOWS MACHINE
                    │
                    ▼
           WINDOWS EXPORTER
                    │
                    ▼
              PROMETHEUS
                    │
                    ▼
              FASTAPI API
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
     Metrics     Processes    Trends
        │           │           │
        └───────────┼───────────┘
                    ▼
              RISK ENGINE
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
     Severity      Risk        Trend
                    │
                    ▼
          TIME-TO-THRESHOLD
                    │
                    ▼
                 LLM
                    │
                    ▼
       AI EXPLANATION + ACTION
                    │
                    ▼
              REACT UI
                    │
                    ▼
            USER / ADMIN
```

---

## 🎯 Purpose of the Project

Traditional monitoring systems primarily show metrics and alerts.

This project aims to make monitoring more intelligent by combining:

- Monitoring
- Historical Analysis
- Risk Detection
- Trend Analysis
- Prediction
- Artificial Intelligence

The goal is to help users understand not only **what** is happening, but also **why** it may be happening and **what action** can be taken.

---

## ⭐ Key Advantages

- Real-time resource monitoring
- Windows system monitoring
- Prometheus-based metrics collection
- Process monitoring
- Historical trend analysis
- Risk detection
- Severity classification
- Predictive time-to-threshold information
- AI-generated explanations
- AI recommendations
- React-based dashboard
- FastAPI backend
- Docker-based monitoring infrastructure
- Modular backend architecture

---

## ⚠️ Current Limitations

- AI explanations depend on the configured LLM service.
- Time-to-threshold predictions depend on the quality and amount of historical data.
- Risk predictions are estimates and should not be treated as guaranteed future outcomes.
- Local LLM performance depends on available system resources.
- Monitoring accuracy depends on the metrics supplied by the monitoring infrastructure.

---

## 🚀 Future Enhancements

Possible future improvements include:

- More advanced anomaly detection
- Machine-learning-based prediction
- Network monitoring
- GPU monitoring
- Temperature monitoring
- Email notifications
- Telegram/Slack notifications
- Historical reports
- Alert management
- User authentication
- Multi-machine monitoring
- Cloud deployment
- Advanced AI agents for automated troubleshooting
- Automatic remediation suggestions

---

## 🔒 Security Considerations

The project should be deployed with appropriate security controls before being exposed outside a local development environment.

Recommended improvements for production deployment include:

- Authentication and authorization
- HTTPS
- Secure environment variables
- API access control
- Rate limiting
- Input validation
- Secure LLM configuration
- Restricted monitoring endpoints

---

## 👨‍💻 Development

The project follows a modular architecture separating:

```
Frontend
   │
   ▼
API Layer
   │
   ▼
Backend Services
   │
   ▼
Monitoring Infrastructure
   │
   ▼
AI / LLM Layer
```

This separation makes the system easier to maintain and extend.

---

## 📌 Summary

The AI Monitoring System combines traditional system monitoring with AI-powered analysis.

The overall workflow is:

```
Windows
   ↓
Windows Exporter
   ↓
Prometheus
   ↓
FastAPI
   ↓
Metrics / Processes / Trends
   ↓
Risk Detection
   ↓
Severity + Risk + Trend
   ↓
Time-to-Threshold
   ↓
LLM
   ↓
AI Explanation + Recommendation
   ↓
React Dashboard
```

The project demonstrates how system monitoring, backend services, data analysis, predictive insights, and artificial intelligence can be combined into a single monitoring platform.


