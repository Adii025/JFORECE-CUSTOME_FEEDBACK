# FeedbackApp - Customer Feedback Management System

A complete full-stack feedback application built according to the 4 core workflow steps:

1. **Step 1: Summary & User Login**: Users can view the feedback summary and log in securely.
2. **Step 2: Registration Page**: New user registration with validation, role selection (`USER` or `ADMIN`), and secure password handling.
3. **Step 3: Edit / Add Feedback**: User can choose to see previously submitted feedback or add new if not submitted, with real-time star rating and category selection.
4. **Step 4: Admin Dashboard (Full CRUD)**: Admin can perform complete **CRUD** operations (Create, Read with search/filter, Update status & admin remarks, Delete) on user feedback.

---

## 🛠️ Available Implementations

You have **two complete architectures** ready in this repository:

| Stack | Path | Description |
|---|---|---|
| **Spring Boot 3 + Java 17** | `backend/` | Production-grade REST API backend with DTOs, Repositories, Controllers & CORS |
| **React 18 + Vite** | `frontend/` | Modern React UI with Tailwind CSS, Auth Context & dual live/offline API sync |
| **Instant Interactive Preview** | `demo-preview.html` | Single-click browser preview of all 4 steps (Zero install required) |
| **Node / Express Fullstack** | `server/` | Express REST server with automated test suite (`npm test`) |

---

## 🚀 How to Run

### 1. Spring Boot Backend (Java 17)
```bash
cd backend
mvn spring-boot:run
```
- Runs on: `http://localhost:8080`
- Endpoints:
  - `POST /api/auth/register` (Step 2)
  - `POST /api/auth/login` (Step 1)
  - `GET /api/feedback/my-feedback` (Steps 1 & 3)
  - `POST /api/feedback` (Step 3: Add new)
  - `PUT /api/feedback/{id}` (Step 3: Edit)
  - `GET /api/admin/feedback` (Step 4: Admin Read)
  - `POST /api/admin/feedback` (Step 4: Admin Create)
  - `PUT /api/admin/feedback/{id}` (Step 4: Admin Update)
  - `DELETE /api/admin/feedback/{id}` (Step 4: Admin Delete)

### 2. React Frontend (Vite)
```bash
cd frontend
npm install
npm run dev
```
- Runs on: `http://localhost:5173`
- Communicates directly with Spring Boot backend at `http://localhost:8080`.

### 3. Instant Zero-Install Demo
Double click **`demo-preview.html`** in any web browser to test all 4 steps immediately with live state and interactive CRUD modals!

### 4. Express Verification Suite
```bash
npm test
```
Runs the automated test suite confirming all 4 workflow steps pass.

---

## 🔑 Pre-Seeded Test Credentials

| Role | Username / Email | Password | Access |
|---|---|---|---|
| **Admin** | `admin` / `admin@feedback.com` | `admin123` | Step 4: Admin Dashboard CRUD |
| **User** | `john_doe` / `john@feedback.com` | `password123` | Steps 1 & 3: Submit & Edit Feedback |
| **User** | `jane_smith` / `jane@feedback.com` | `password123` | Steps 1 & 3: Submit & Edit Feedback |
