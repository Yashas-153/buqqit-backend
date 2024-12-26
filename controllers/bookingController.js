const prisma = require('../database/prismaPostgress');
const { transporter } = require('../utils/emailVerification')

const createBooking = async (req, res) => {
  const { userId, studioId, startTime, endTime, totalCost } = req.body;
  const bookingDate = new Date(startTime);
  const dayOfWeek = bookingDate.getDay();
  const timeStart = new Date(startTime).toTimeString().slice(0,8);
  const timeEnd = new Date(endTime).toTimeString().slice(0,8);

  try {
      // Check if studio exists
      const studio = await prisma.studio.findUnique({
          where: { id: parseInt(studioId) },
          include: { 
              availability: true,
              address: true // Include address for email
          }
      });

      if (!studio) {
          return res.status(404).json({ error: 'Studio not found' });
      }

      // Get user details for email
      const user = await prisma.user.findUnique({
          where: { id: parseInt(userId) },
          select: {
              email: true,
              name: true
          }
      });

      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Check if the time slot is available in studio's availability
      const availableSlot = studio.availability.find(slot => 
          slot.day_of_week === dayOfWeek &&
          slot.start_time.toTimeString().slice(0,8) <= timeStart &&
          slot.end_time.toTimeString().slice(0,8) >= timeEnd
      );

      if (!availableSlot) {
          return res.status(400).json({ error: 'Studio is not available during this time slot' });
      }

      // Check for overlapping bookings
      const overlappingBookings = await prisma.booking.findMany({
          where: {
              studio_id: parseInt(studioId),
              AND: [{
                  start_time: { lte: new Date(endTime) },
                  end_time: { gte: new Date(startTime) }
              }],
              status: "Confirmed"
          }
      });

      if (overlappingBookings.length > 0) {
          return res.status(400).json({ error: 'Studio is already booked for the given time slot' });
      }

      // Create booking
      const booking = await prisma.booking.create({
          data: {
              user_id: parseInt(userId),
              studio_id: parseInt(studioId),
              start_time: new Date(startTime),
              end_time: new Date(endTime),
              total_cost: totalCost,
              status: "Confirmed"
          }
      });

      // Prepare and send confirmation email
      const emailContent = `
          Dear ${user.name},

          Your booking has been confirmed!

          Booking Details:
          - Studio: ${studio.name}
          - Address: ${studio.address.address}, ${studio.address.city}
          - Date: ${new Date(startTime).toLocaleDateString()}
          - Time: ${timeStart} - ${timeEnd}
          - Total Cost: $${totalCost}

          Thank you for booking with us!

          Best regards,
          Studio Booking Team
      `;

      const mailOptions = {
          from: process.env.EMAIL,
          to: user.email,
          subject: 'Booking Confirmation',
          text: emailContent
      };

      // Send email
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.log('Error sending confirmation email:', error);
              // Note: We don't return here as the booking was successful
          } else {
              console.log('Confirmation email sent:', info.response);
          }
      });

      res.status(201).json(booking);
  } 
  catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to create booking' });
  }
};

const getBookings = async (req, res) => {
    const { booking_id, user_id, studio_id } = req.query;

    try {
        let bookings;
        const queryOptions = {
            include: {
                studio: {
                    include: {
                        address: true,
                        photos: true
                    }
                },
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone_number: true
                    }
                }
            }
        };

        if (booking_id) {
            bookings = await prisma.booking.findUnique({
                where: { id: parseInt(booking_id) },
                ...queryOptions
            });
        } else if (user_id) {
            bookings = await prisma.booking.findMany({
                where: { user_id: parseInt(user_id) },
                ...queryOptions
            });
        } else if (studio_id) {
            bookings = await prisma.booking.findMany({
                where: { studio_id: parseInt(studio_id) },
                ...queryOptions
            });
        } else {
            return res.status(400).json({ error: 'Missing query parameter' });
        }

        if (!bookings) {
            return res.status(404).json({ error: 'No bookings found' });
        }

        res.json(bookings);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
};

module.exports = {
    createBooking,
    getBookings
};