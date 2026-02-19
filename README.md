# HRMS Frontend Dashboard

HRMS Frontend is a responsive dashboard built using React that visualizes attendance analytics and connects with the FastAPI backend.

---

## Live App

Production URL: https://hrms-frontend-i74w.onrender.com/

---

## Tech Stack

- React.js
- Axios
- Tailwind CSS
- Recharts
- Render (Deployment)

---

## Project Structure

```
frontend/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── App.js
│
├── package.json
└── public/
```

---

## Setup Locally

### 1. Clone Repo

```bash
git clone <your-frontend-repo-url>
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm start
```

Runs on: http://localhost:3000

---

## Backend Integration

Backend Base URL:

```
https://hrms-backend-lj2z.onrender.com
```

Example API Call:

```js
axios.get("/attendance/weekly")
```

---

## Features

- Weekly Attendance Analytics
- Present Percentage Calculation
- Dynamic Chart Visualization
- Responsive UI
- Live API Integration

---

## Deployment

Hosted on Render.

Production URL: https://hrms-frontend-i74w.onrender.com/

---

## Demo Video

https://www.awesomescreenshot.com/video/49601085?key=bc4923ab9554e7f94a1be1242177df48