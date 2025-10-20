const express = require('express');
//const http = require('http');
//const https = require('https');
const cookieParser = require('cookie-parser');
const cors = require('cors');



const {testDBConnection,connectMongoDB} = require('./config/db');
require('dotenv').config();

//const { initSocket } = require('./config/socket');

// const authRoutes = require('./routes/authRoutes');
// const bookRoutes = require('./routes/bookRoutes');
// const issueRoutes = require('./routes/issueRoutes');
// const memberRoutes = require('./routes/memberRoutes');
const libraryRoutes = require("./routes/libraryRoutes");
const librarianRoutes = require("./routes/librarianRoutes");
const bookRoutes = require("./routes/bookRoutes");
const otherRoutes = require("./routes/other");
const app = express();

const corsOptions = {
  origin:
    process.env.MODE === "local"
      ? "http://localhost:3000"
      : "https://book-flow-frontend.vercel.app",
  credentials: true, // important for cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());


// API Routes

// app.use('/api/books', bookRoutes);
// app.use('/api/issues', issueRoutes);
// app.use('/api/members', memberRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/librarian", librarianRoutes);
app.use("/api/book", bookRoutes);
app.use("/api", otherRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});
// app.get("/test",mid("library"), (req, res) => {
   
//     res.json("all cool in server");
// })
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
