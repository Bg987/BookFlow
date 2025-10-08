const express = require('express');
//const http = require('http');
//const https = require('https');
const cookieparser = require('cookie-parser');
const cors = require('cors');
const mid = require("./middlewares/authenticateRoleMiddleware")

const {testDBConnection,connectMongoDB} = require('./config/db');
require('dotenv').config();

//const { initSocket } = require('./config/socket');

// const authRoutes = require('./routes/authRoutes');
// const bookRoutes = require('./routes/bookRoutes');
// const issueRoutes = require('./routes/issueRoutes');
// const memberRoutes = require('./routes/memberRoutes');
const libraryRoutes = require("./routes/libraryRoutes");

const app = express();
app.use(express.json());
app.use(cookieparser());
const corsOptions = {
  origin: process.env.MODE === "local" 
    ? "http://localhost:3000" 
    : "https://book-flow-frontend.vercel.app",
  credentials: true, // important for cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));


// API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/books', bookRoutes);
// app.use('/api/issues', issueRoutes);
// app.use('/api/members', memberRoutes);
app.use("/api/library", libraryRoutes);
// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});
app.get("/test",mid("library"), (req, res) => {
   
    res.json("all cool in server");
})
const PORT = process.env.PORT || 5000;
//const server = process.env.PORT === "local"?
//                http.createServer(app):https.createServer(app);

// Initialize Socket.IO
//initSocket(server);
app.listen(PORT, async() => {
    await testDBConnection();
    await connectMongoDB();
    console.log(`Server running on port ${PORT}`);
});
