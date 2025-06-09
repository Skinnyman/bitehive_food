
# 🐝 BiteHive

BiteHive is a full-stack food ordering and vendor management platform, where users can browse meals, place orders, and vendors can manage listings and orders in real-time.

---

## 🚀 Tech Stack

* **Frontend:** React, Axios, Tailwind CSS
* **Backend:** Node.js, Express
* **Database:** MongoDB
* **Authentication:** JWT

---

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Skinnyman/bitehive.git
cd bitehive
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bitehive
JWT_SECRET=your_jwt_secret
```

Then run the backend:

```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

#### Create a `.env` file in the `frontend` directory:

```env
REACT_APP_SERVER_PORT=http://localhost:5000
```

Then run the frontend:

```bash
npm start
```

---

## 📂 Project Structure

```
bitehive/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
```

---

## 🔐 Environment Variables Summary

| Variable                | Location | Description                       |
| ----------------------- | -------- | --------------------------------- |
| `PORT`                  | Backend  | Port the server runs on           |
| `MONGO_URI`             | Backend  | MongoDB connection URI            |
| `JWT_SECRET`            | Backend  | Secret key for JWT authentication |
| `REACT_APP_SERVER_PORT` | Frontend | Server base URL for API requests  |

---

## 💬 Contact

For questions or support, open an issue or reach out via GitHub.
