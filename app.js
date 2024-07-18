const dotenv = require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./Config/db");

const passport = require("passport");
const cookieSession = require("cookie-session");

const authRoutes = require("./Routes/userRoutes");

// Connect to the database
connectDB();

// Initialinzing Express App
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// g-auth
app.use(
  cookieSession({
    name: "session",
    keys: ["somesessionkey"],
    maxAge: 24 * 60 * 60 * 100,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

// Routes
app.use("/auth", authRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
