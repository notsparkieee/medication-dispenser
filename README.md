# 💊 Medication Dispenser Backend API

This is the backend service for a smart medication dispenser system built using **Node.js**, **Express**, and **PostgreSQL**. It allows medical staff to schedule medicine doses for patients via devices and pods, and provides APIs for ESP32 devices to fetch the schedules.

---

## ⚙️ Features

- 🧠 Add patient medication schedules (date + time in IST)
- 🔄 ESP32-compatible API to fetch today’s schedule
- ⏰ Timezone handling using Luxon (IST support)
- 🧪 Debug route to view recent DB entries

---

## 📁 Folder Structure

```
medication-dispenser/
├── db.js              # PostgreSQL connection setup
├── server.js          # Express app with API routes
├── package.json
├── .env               # DB credentials (not uploaded to GitHub)
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/notsparkieee/medication-dispenser.git
cd medication-dispenser
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up `.env` file

Create a `.env` file in the root:

```env
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
DB_NAME=newdb
```

> ⚠️ Make sure your PostgreSQL DB is running and has a table:
> `medication_schedule (id, patient_name, device, pod, dose_time)`

### 4. Start the server

```bash
npm start
```

The server will run at `http://localhost:3000`

---

## 🧪 API Endpoints

### `POST /add-patient`

Add a new patient schedule.

**Request Body:**

```json
{
  "name": "John Doe",
  "device": 1,
  "pod": 2,
  "time": "14:30"  // IST time in HH:mm
}
```

---

### `GET /api/schedule?device=1&pod=2`

Returns today's schedule for the given device and pod in IST.

---

### `GET /debug/show-times`

Returns last 10 entries in the database (for debugging).

---

## 🛠️ Built With

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Luxon](https://moment.github.io/luxon/)

---

## 👨‍💻 Author

**Siddhant Khare**  
GitHub: [@notsparkieee](https://github.com/notsparkieee)

---

## 🔐 Disclaimer

Don’t forget to:
- Add `.env` to your `.gitignore`
- Never push your credentials to GitHub
