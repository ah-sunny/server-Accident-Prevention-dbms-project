# Accident Prevention System – Server 🚀

This is the backend/server-side codebase for the **Accident Prevention System**, a full-stack web application that identifies and visualizes accident-prone zones and allows users to submit accident data. The backend handles API requests, MySQL database operations, and user access logic.

🔗 **Client Repository**: [Accident Prevention System – Frontend](https://github.com/ah-sunny/Accident-Prevention-system-dbms-project)

🔗 **Live Website**: [Accident Prevention System](https://accident-prevention-system1.web.app/)

---

## 📌 Features

- RESTful APIs for managing accident details, danger zones, user accounts, and admin controls
- MySQL database integration with efficient query handling
- JWT authentication for secure user and admin access
- Role-based route protection (normal users vs. admins)
- Serverless-ready deployment support
- CORS configuration for client-server communication

---

## 🛠️ Technologies Used

- Node.js
- Express.js
- MySQL2
- CORS
- Dotenv
- Serverless-HTTP
- JWT (JSON Web Token)

---

## 📦 Installation

### Prerequisites:
- Node.js installed
- MySQL database (local or hosted)
- `.env` file with required credentials

### Steps:

```bash
# Clone the repository
git clone https://github.com/your-username/accident-prevention-system-server.git

# Navigate to the server folder
cd accident-prevention-system-server

# Install dependencies
npm install

# Create a `.env` file in the root directory and add the following:
# Replace values with your actual DB and JWT config

DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
JWT_SECRET=your-jwt-secret
PORT=5000

# Run the server (development)
nodemon index.js
```

## 🌐 Deployment

This server can be deployed to platforms like **Vercel**, **Railway**, **Render**, or **Cyclic** using `serverless-http` for serverless deployment support.

- Configure serverless functions using a `vercel.json` or Railway’s deployment settings.
- Set up all necessary environment variables (e.g., database credentials, JWT secrets) in your deployment dashboard.
- Compatible with both monorepo and standalone backend deployments.

> _Note: MySQL database is deployed on [Clever Cloud](https://www.clever-cloud.com/) for remote access and live data integration._


<br />

## 👤 Author

**Arafat Sunny**  
B.Sc in CSE, National Institute of Textile Engineering and Research (NITER)  
MERN Stack Developer <br/>
[LinkedIn](https://www.linkedin.com/in/-sunny) | [GitHub](https://github.com/ah-sunny)
