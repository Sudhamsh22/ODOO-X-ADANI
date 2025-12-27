⚙️ GearGuard

Smart Equipment & Operations Management System

GearGuard is a full-stack web application inspired by Odoo-style enterprise systems, designed to manage equipment, work centers, teams, and operational requests through a modern, scalable architecture.
It provides a clean dashboard, secure authentication, and modular APIs for real-world business workflows.

📌 Key Highlights

Modern Next.js frontend with responsive UI

Secure JWT-based authentication

Scalable Node.js + Express backend

MySQL database integration

Dashboard with analytics & charts

Modular, maintainable code structure

🧱 Tech Stack
Frontend

Next.js (App Router)

React

Tailwind CSS

ShadCN UI

Recharts (analytics & graphs)

DND Kit (drag & drop)

Three.js (visual components)

Backend

Node.js

Express.js

MySQL

JWT Authentication

bcrypt

dotenv

CORS

📂 Project Structure
GearGuard/
├── Odoo-frontend-main/
│   ├── app/
│   ├── components/
│   ├── docs/
│   ├── public/
│   ├── styles/
│   ├── .env.local
│   └── package.json
│
├── Odoo-backend-main/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── app.js
│   ├── .env
│   └── package.json

🔐 Core Features
Authentication

Secure login using JWT

Password hashing with bcrypt

Protected API routes via middleware

Dashboard

Operational overview

Visual analytics and metrics

API-driven data rendering

Management Modules

Equipment Management

Work Centers

Teams

Categories

Requests & Workflows

Metadata APIs

⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone <https://github.com/Sudhamsh22/ODOO-X-ADANI.git>
cd GearGuard

2️⃣ Backend Setup
cd Odoo-backend-main
npm install


Create .env:

PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=gearguard_db
JWT_SECRET=your_secret_key


Run backend:

npm run dev


Backend URL:

http://localhost:5000

3️⃣ Frontend Setup
cd Odoo-frontend-main
npm install
npm run dev


Frontend URL:

http://localhost:3000

🔄 Frontend–Backend Communication

REST APIs over HTTP

JWT passed via Authorization headers

Centralized API base URL using environment variables

📄 Documentation

Design references and blueprints are available in:

Odoo-frontend-main/docs/

🚀 Deployment Ready

Frontend: Vercel / Netlify

Backend: Railway / Render / VPS

Environment-based configuration supported

🔮 Future Enhancements

Role-based access control

Pagination & filtering

File uploads

Real-time notifications

Dockerized deployment

👨‍💻 Author

GearGuard was built as a full-stack systems project focusing on scalability, clean architecture, and real-world operational workflows.
