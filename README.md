# 🧠 LogiInsight AI

![Angular](https://img.shields.io/badge/Angular-18+-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB_Time--Series-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**LogiInsight AI** is an enterprise-grade, real-time log aggregation and observability platform. It ingests distributed system logs, visualizes system health via a reactive dashboard, and leverages LLMs to provide instant, automated root-cause analysis on critical stack traces.

---

## 🚀 Key Features & Engineering Highlights

*   **Real-Time Streaming:** High-throughput ingestion API utilizing Node.js streams and **Socket.io** to push high-severity logs (`CRITICAL`, `FATAL`) to active clients instantly.
*   **Optimized Storage Engine:** Implements **MongoDB Time-Series Collections** for highly efficient log storage, combined with TTL (Time-To-Live) indexes to automatically purge data older than 30 days.
*   **AI-Powered Diagnostics:** Intercepts unhandled exceptions and uses LLMs (via LangChain/GenAI API) to generate Markdown-formatted root-cause analysis and actionable code fixes.
*   **Reactive Dashboard:** An enterprise Angular UI heavily leveraging **RxJS** (`switchMap`, `debounceTime`, `mergeMap`) for multi-stream state management, live filtering, and custom performance charting.
*   **Non-Blocking Parsing:** Offloads heavy log parsing and Regex pattern matching to **Node.js Worker Threads**, ensuring the main event loop remains unblocked during ingestion spikes.

---

## 📐 System Architecture

```mermaid
graph TD;
    A[External Microservices / Apps] -->|HTTP POST JSON Logs| B(Node.js Ingestion API);
    B --> C{Log Severity?};
    C -->|INFO / WARN| D[(MongoDB Time-Series)];
    C -->|CRITICAL / ERROR| E[AI Diagnostics Worker];
    E -->|GenAI Request| F[LLM API];
    F -->|Markdown Fix| D;
    B -->|Broadcast via Socket.io| G[Angular Reactive UI];
    D -->|Aggregated Metrics via REST| G;
