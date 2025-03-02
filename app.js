require("dotenv").config(); 
const cors = require("cors");
const express = require('express');
const cookieParser = require('cookie-parser');

const addonsRouter = require('./routes/addonRouter')
const amenityRoutes= require("./routes/amenityRoutes");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes= require("./routes/bookingRoutes");
const calendarRoutes = require('./routes/calendarRoutes')
const equipmentRouts = require('./routes/equipmentRouter')
const propRoutes = require("./routes/propsRoutes");
const reviewRoutes= require("./routes/reviewRoutes");
const locationRoutes = require('./routes/locationRoutes');
const studioRoutes= require("./routes/studioRoutes");

const app = express();
app.use(cors());

app.use(express.json());
app.use(cookieParser()); 

const port = process.env.NODE_PORT;

app.use(express.json());
app.use('/addons',addonsRouter)
app.use("/amenity", amenityRoutes);
app.use("/auth", authRoutes);
app.use("/bookings", bookingRoutes);
app.use('/calendar', calendarRoutes);
app.use("/equipments", equipmentRouts);
app.use("/props", propRoutes);
app.use("/reviews", reviewRoutes);
app.use('/search', locationRoutes);
app.use("/studios", studioRoutes);
app.use('/uploads', express.static('uploads'));

app.listen(port, '0.0.0.0', () => {
    console.log(`Listening on Port ${port}`);
});

app.get("/", (req, res) => {
    res.json({ "msg": "Thank you for coming" });
});
