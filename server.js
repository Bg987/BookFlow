const express = require('express');
const http = require('http');

const cookieParser = require('cookie-parser');
const cors = require('cors');
const initSocket = require('./config/socket');
require("dotenv").config();
const { testDBConnection, connectMongoDB } = require('./config/db');
const app = express();

const server = http.createServer(app)
const corsOptions = {
  origin:
    process.env.MODE === "local"
      ? [
          "http://localhost:3000",
          "http://192.168.41.47:3000",
          "http://10.182.99.47:3000",
        ]
      : "https://book-flow-frontend.vercel.app",
  credentials: true, //for cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// const issueRoutes = require('./routes/issueRoutes');
// const memberRoutes = require('./routes/memberRoutes');
const libraryRoutes = require("./routes/libraryRoutes");
const librarianRoutes = require("./routes/librarianRoutes");
const bookRoutes = require("./routes/bookRoutes");
const memberRoutes = require("./routes/memberRoutes");
const otherRoutes = require("./routes/other");

// API Routes
app.use("/api/library", libraryRoutes);
app.use("/api/librarian", librarianRoutes);
app.use("/api/book", bookRoutes);
app.use("/api/member", memberRoutes);
app.use("/api", otherRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});
app.get("/test", (req, res) => {
    res.json("all cool in server");
})


//Initialize Socket.IO
initSocket(server, corsOptions);

server.listen(process.env.PORT || 5000, async () => {
  await testDBConnection();
  await connectMongoDB();

  console.log(`Server running`);
});
