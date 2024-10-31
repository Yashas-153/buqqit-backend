const prisma = require('../database/prismaPostgress');

const createBooking = async (req, res) => {
    const { userId, studioId, startTime, endTime, totalCost} = req.body;
    const overlappingBookings = await prisma.booking.findMany({
        where: {
            studio_id: parseInt(studioId),
            AND: [{
                    start_time: { lte: endTime },
                    end_time: { gte: startTime }
            }]
        }
    });

    if (overlappingBookings.length > 0) {
        return res.status(400).json({ error: 'Studio is already booked for the given time slot' });
    }
    try {
        const booking = await prisma.booking.create({
        data: {
            user_id: parseInt(userId),
            studio_id: parseInt(studioId),
            start_time: new Date(startTime),
            end_time: new Date(endTime),
            total_cost:totalCost,
            status:"confirmed"
        }
        });
        res.status(201).json(booking);
    } 
    catch (error){
        console.log(error)
        res.status(500).json({ error: 'Failed to create booking' });
    }
};

const getBookings = async (req, res) => {
  const { booking_id, user_id, studio_id } = req.query;

  try {
    let bookings;

    if (booking_id) {
      bookings = await prisma.booking.findUnique({
        where: { id: parseInt(booking_id) }
      });
    } else if (user_id) {
      bookings = await prisma.booking.findMany({
        where: { user_id: parseInt(user_id) }
      });
    } else if (studio_id) {
      bookings = await prisma.booking.findMany({
        where: { studio_id: parseInt(studio_id) }
      });
    } else {
      return res.status(400).json({ error: 'Missing query parameter' });
    }

    if (!bookings) {
      return res.status(404).json({ error: 'No bookings found' });
    }

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

module.exports = {
  createBooking,
  getBookings
};
