const dotenv = require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./Config/db");
require("./Routes/passport");
const passport = require("passport");
const cookieSession = require("cookie-session");
const mongoose = require("mongoose");

const authRoutes = require("./Routes/userRoutes");
const productRoutes = require("./Routes/productsRoutes");
const projectRoutes = require("./Routes/projectRoutes");

// Connect to the database
connectDB();

// Initializing Express App
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

// Routes
app.use("/product", productRoutes);

// Routes
app.use("/projects", projectRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
