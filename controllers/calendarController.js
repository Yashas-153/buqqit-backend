const prisma = require('../database/prismaPostgress')

// Controller to get availability slots
module.exports.getAvailabilitySlots = async (req, res) => {
    const { studio_id, date } = req.query;

    if (!studio_id || !date) {
        return res.status(400).json({ error: 'studio_id and date are required' });
    }

    try {
        // Fetch availability for the given studio and date
        const availability = await prisma.availability.findMany({
            where: {
                studio_id: parseInt(studio_id),
                date: new Date(date),
            },
        });

        // Fetch bookings for the given studio and date
        const bookings = await prisma.booking.findMany({
            where: {
                studio_id: parseInt(studio_id),
                start_time: {
                    gte: new Date(date),
                    lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
                },
            },
        });

        // Generate one-hour slots
        const slots = [];
        for (let i = 0; i < 24; i++) {
            const startTime = new Date(new Date(date).setHours(i, 0, 0, 0));
            const endTime = new Date(new Date(date).setHours(i + 1, 0, 0, 0));

            // Check if the slot is available
            const isAvailable = availability.some(avail => {
                const availStart = new Date(new Date(date).setHours(avail.start_time, 0, 0, 0));
                const availEnd = new Date(new Date(date).setHours(avail.end_time, 0, 0, 0));

                return startTime >= availStart && endTime <= availEnd;
            });

            // Check if the slot is booked
            const isBooked = bookings.some(booking => {
                const bookingStart = new Date(booking.start_time);
                const bookingEnd = new Date(booking.end_time);

                return startTime < bookingEnd && endTime > bookingStart;
            });

            slots.push({
                time_index: i,
                timings: `${i}:00am`,
                available: isAvailable && !isBooked,
            });
        }

        res.json(slots);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

