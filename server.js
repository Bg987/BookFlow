const express = require('express');
//const http = require('http');
//const https = require('https');
const cors = require('cors');
const {testDBConnection,connectMongoDB} = require('./config/db');
require('dotenv').config();

//const { initSocket } = require('./config/socket');

// const authRoutes = require('./routes/authRoutes');
// const bookRoutes = require('./routes/bookRoutes');
// const issueRoutes = require('./routes/issueRoutes');
// const memberRoutes = require('./routes/memberRoutes');
const libraryRoutes = require("./routes/libraryRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.get("/x", (req, res) => {
    res.json("hiiiii");
})
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
