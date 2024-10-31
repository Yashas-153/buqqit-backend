require("dotenv").config(); 
const cors = require("cors");
const express = require('express');
const authRoutes = require("./routes/authRoutes");
const studioRoutes= require("./routes/studioRoutes");
const bookingRoutes= require("./routes/bookingRoutes");
const reviewRoutes= require("./routes/reviewRoutes");
const amenityRoutes= require("./routes/amenityRoutes");
const searchRoutes = require('./routes/searchRoutes');
const propRoutes = require("./routes/propsRoutes");

const app = express();
app.use(cors());

const port = process.env.NODE_PORT;
// const port = 8080;

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use("/auth", authRoutes);
app.use("/studios", studioRoutes);
app.use("/props", propRoutes);
app.use("/bookings", bookingRoutes);
app.use("/reviews", reviewRoutes);
app.use("/amenity", amenityRoutes);
app.use('/search', searchRoutes);

app.listen(port, '0.0.0.0', () => {
    console.log(`Listening on Port ${port}`);
});

app.get("/", (req, res) => {
    res.json({ "msg": "Thank you for coming" });
});
