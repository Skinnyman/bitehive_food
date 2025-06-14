
# 🐝 BiteHive

BiteHive is a full-stack food ordering and vendor management platform, where users can browse meals, place orders, and vendors can manage listings and orders in real-time.

---

## 🚀 Tech Stack

* **Frontend:** React, Axios, Tailwind CSS
* **Backend:** Node.js, Express
* **Database:** MongoDB
* **Authentication:** JWT
* **Image storing:** AWS S3 

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
FRONTEND=your frontend port
BUCKETNAME=your bucket name
REGION=your region
AWS_ACCESS_KEY_ID=your aws access key
AWS_SECRET_ACCESS_KEY=your aws secret access
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
REACT_APP_SERVER_PORT=your backend port 
REACT_APP_TOKEN=your token
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
│   ├── services/
|   ├── s3Config/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── Assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── Static/
│   │   └── App.js
```

---

## 🔐 Environment Variables Summary

| Variable                | Location | Description                       |
| ----------------------- | -------- | --------------------------------- |
| `PORT`                  | Backend  | Port the server runs on           |
| `MONGO_URI`             | Backend  | MongoDB connection URI            |
| `JWT_SECRET`            | Backend  | Secret key for JWT authentication |
| `FRONTEND`            | Backend  | Port the frontend is running on |
| `BUCKETNAME`            | Backend  | The name of your bucket in aws S3 |
| `REGION`            | Backend  | name of your region in aws s3 bucket |
| `AWS_ACCESS_KEY_ID` | Backend |Your access key    |
| `AWS_SECRET_ACCESS_KEY` | Backend | Your secret key  |
| `REACT_APP_SERVER_PORT` | Frontend | Server base URL for API requests  |
| `REACT_APP_TOKEN` | Frontend | Your token from mapbox gl  |

---

## 💬 Contact

For questions or support, open an issue or reach out via GitHub.
