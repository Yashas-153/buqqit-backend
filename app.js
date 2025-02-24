require("dotenv").config(); 
const cookieParser = require('cookie-parser');
const cors = require("cors");
const express = require('express');
const authRoutes = require("./routes/authRoutes");
const studioRoutes= require("./routes/studioRoutes");
const bookingRoutes= require("./routes/bookingRoutes");
const reviewRoutes= require("./routes/reviewRoutes");
const amenityRoutes= require("./routes/amenityRoutes");
const searchRoutes = require('./routes/searchRoutes');
const propRoutes = require("./routes/propsRoutes");
const addonsRouter = require('./routes/addonRouter')
const equipmentRouts = require('./routes/equipmentRouter')
const calendarRoutes = require('./routes/calendarRoutes')

const app = express();
app.use(cors());

app.use(express.json());
app.use(cookieParser()); 

const port = process.env.NODE_PORT;

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use("/auth", authRoutes);
app.use("/studios", studioRoutes);
app.use("/bookings", bookingRoutes);
app.use("/calendar", calendarRoutes);
app.use("/amenity", amenityRoutes);
app.use("/props", propRoutes);
app.use("/equipments", equipmentRouts);
app.use('/search', searchRoutes);
app.use('/addons',addonsRouter)
app.use("/reviews", reviewRoutes);

app.listen(port, '0.0.0.0', () => {
    console.log(`Listening on Port ${port}`);
});

app.get("/", (req, res) => {
    res.json({ "msg": "Thank you for coming" });
});
