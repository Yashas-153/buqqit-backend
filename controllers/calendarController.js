const prisma =  require("../database/prismaPostgress")
// import prisma from '../database/prismaPostgress'
exports.getStudioAvailability= async(req, res)=> {
    try {
        const { studioId } = req.params;
        const year = parseInt(req.query.year);
        const month = parseInt(req.query.month) - 1; // JS months are 0-indexed

        if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
            return res.status(400).json({ error: 'Invalid year or month' });
        }

        // Find the studio
        const studio = await prisma.studio.findUnique({
            where: { id: studioId }
        });

        if (!studio) {
            return res.status(404).json({ error: 'Studio not found' });
        }

        // Generate the date range for the month
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0); // Last day of the month

        // Get all days in the month
        const daysInMonth = getDaysInMonth(startDate, endDate);

        // Define business hours (7am to 10pm)
        const openingHour = 7;
        const closingHour = 22;

        // Get studio's default hours
        const defaultHours = await prisma.studioDefaultHours.findMany({
            where: { studio_id: studioId }
        });

        // Get studio's special hours for this month
        const specialHours = await prisma.studioSpecialHours.findMany({
            where: {
                studio_id: studioId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        // Get existing bookings for this month
        const bookings = await prisma.booking.findMany({
            where: {
                studio_id: studioId,
                date: {
                    gte: startDate,
                    lte: endDate
                },
                status: {
                    notIn: ['cancelled']
                }
            }
        });

        // Get the hourly rate (for simplicity, we'll use a fixed price from the first slot)
        const sampleSlot = await prisma.studioSlot.findFirst({
            where: { studio_id: studioId }
        });

        const hourlyRate = sampleSlot?.price || 100.00; // Default to 100 if no slots found

        // Build the response
        const days = daysInMonth.map(date => {
            const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
            const formattedDate = formatDate(date);

            // Check if there are special hours for this date
            const specialDay = specialHours.find(sh =>
                formatDate(sh.date) === formattedDate
            );

            // Check if there are default hours for this day of the week
            const defaultDay = defaultHours.find(dh => dh.day_of_week === dayOfWeek);

            // If the studio is closed on this day, return early with all hours unavailable
            if (
                (specialDay && specialDay.is_closed) ||
                (defaultDay && defaultDay.is_closed && !specialDay)
            ) {
                const hours = [];
                for (let hour = openingHour; hour <= closingHour; hour++) {
                    hours.push({
                        hour,
                        time: `${hour.toString().padStart(2, '0')}:00`,
                        is_available: false
                    });
                }
                return { date: formattedDate, hours };
            }

            // If we have special hours, use them. Otherwise, use default hours or business hours
            let studioOpenHour = openingHour;
            let studioCloseHour = closingHour;

            if (specialDay && specialDay.open_time && specialDay.close_time) {
                studioOpenHour = specialDay.open_time.getHours();
                studioCloseHour = specialDay.close_time.getHours();
            } else if (defaultDay && !defaultDay.is_closed) {
                studioOpenHour = defaultDay.open_time.getHours();
                studioCloseHour = defaultDay.close_time.getHours();
            }

            // Filter bookings for this date
            const dateBookings = bookings.filter(booking =>
                formatDate(booking.date) === formattedDate
            );

            // Generate hours
            const hours = [];
            for (let hour = openingHour; hour <= closingHour; hour++) {
                // Check if the studio is open at this hour
                const isWithinOpeningHours = hour >= studioOpenHour && hour < studioCloseHour;

                // Check if there's a booking at this hour
                const isBooked = dateBookings.some(booking => {
                    const bookingStart = booking.start_time.getHours();
                    const bookingEnd = booking.end_time.getHours();
                    return hour >= bookingStart && hour < bookingEnd;
                });

                hours.push({
                    hour,
                    time: `${hour.toString().padStart(2, '0')}:00`,
                    is_available: isWithinOpeningHours && !isBooked
                });
            }

            return {
                date: formattedDate,
                hours
            };
        });

        return res.json({
            studio: {
                id: studio.id,
                name: studio.name,
                hourly_rate: hourlyRate
            },
            days
        });

    } catch (error) {
        console.error('Error getting studio availability:', error);
        return res.status(500).json({ error: 'Failed to get studio availability' });
    }
}

/**
 * Get all days in a month between start and end date
 */
function getDaysInMonth(start, end) {
    const days = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
        days.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
}


exports.getAvailabilitySlots= async(req, res)=>{
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
/**
 * Default Hours Management
 */

// Get default hours for a studio
// GET /api/studios/:studioId/default-hours
exports.getStudioDefaultHours= async(req, res)=> {
    try {
        const { studioId } = req.params;

        const defaultHours = await prisma.studioDefaultHours.findMany({
            where: { studio_id: studioId },
            orderBy: { day_of_week: 'asc' }
        });

        return res.json(defaultHours);

    } catch (error) {
        console.error('Error getting default hours:', error);
        return res.status(500).json({ error: 'Failed to get default hours' });
    }
}

// Set default hours for a studio
// POST /api/studios/:studioId/default-hours
exports.setStudioDefaultHours= async(req, res)=> {
    try {
        const { studioId } = req.params;
        const { day_of_week, open_time, close_time, is_closed } = req.body;

        // Validate request
        if (day_of_week === undefined || ((!open_time || !close_time) && !is_closed)) {
            return res.status(400).json({
                error: 'Missing required fields. Provide day_of_week and either open_time+close_time or is_closed=true'
            });
        }

        if (day_of_week < 0 || day_of_week > 6) {
            return res.status(400).json({ error: 'day_of_week must be between 0 (Sunday) and 6 (Saturday)' });
        }

        // Check if studio exists
        const studio = await prisma.studio.findUnique({
            where: { id: studioId }
        });

        if (!studio) {
            return res.status(404).json({ error: 'Studio not found' });
        }

        // Format times
        let openTimeDate = null;
        let closeTimeDate = null;

        if (!is_closed) {
            // Parse time strings (format: HH:MM)
            const [openHour, openMinute] = open_time.split(':').map(Number);
            const [closeHour, closeMinute] = close_time.split(':').map(Number);

            // Create Date objects with time set
            openTimeDate = new Date();
            openTimeDate.setHours(openHour, openMinute, 0, 0);

            closeTimeDate = new Date();
            closeTimeDate.setHours(closeHour, closeMinute, 0, 0);

            if (openTimeDate >= closeTimeDate) {
                return res.status(400).json({ error: 'open_time must be earlier than close_time' });
            }
        }

        // Upsert default hours (create or update)
        const defaultHours = await prisma.studioDefaultHours.upsert({
            where: {
                studio_id_day_of_week: {
                    studio_id: studioId,
                    day_of_week: day_of_week
                }
            },
            update: {
                open_time: is_closed ? null : openTimeDate,
                close_time: is_closed ? null : closeTimeDate,
                is_closed: is_closed || false
            },
            create: {
                studio_id: studioId,
                day_of_week: day_of_week,
                open_time: is_closed ? null : openTimeDate,
                close_time: is_closed ? null : closeTimeDate,
                is_closed: is_closed || false
            }
        });

        return res.json(defaultHours);

    } catch (error) {
        console.error('Error setting default hours:', error);
        return res.status(500).json({ error: 'Failed to set default hours' });
    }
}

// Delete default hours for a specific day
// DELETE /api/studios/:studioId/default-hours/:dayOfWeek
exports.deleteStudioDefaultHours= async(req, res)=> {
    try {
        const { studioId, dayOfWeek } = req.params;
        const day = parseInt(dayOfWeek);

        if (isNaN(day) || day < 0 || day > 6) {
            return res.status(400).json({ error: 'Invalid day of week' });
        }

        await prisma.studioDefaultHours.delete({
            where: {
                studio_id_day_of_week: {
                    studio_id: studioId,
                    day_of_week: day
                }
            }
        });

        return res.json({ success: true });

    } catch (error) {
        console.error('Error deleting default hours:', error);
        return res.status(500).json({ error: 'Failed to delete default hours' });
    }
}

/**
 * Special Hours Management
 */

// Get special hours for a studio
// GET /api/studios/:studioId/special-hours?start_date=2025-03-01&end_date=2025-03-31
exports.getStudioSpecialHours= async(req, res)=> {
    try {
        const { studioId } = req.params;
        const { start_date, end_date } = req.query;

        let startDate = null;
        let endDate = null;

        if (start_date) {
            startDate = new Date(start_date);
        }

        if (end_date) {
            endDate = new Date(end_date);
        }

        const where = { studio_id: studioId };

        if (startDate && endDate) {
            where.date = {
                gte: startDate,
                lte: endDate
            };
        } else if (startDate) {
            where.date = {
                gte: startDate
            };
        } else if (endDate) {
            where.date = {
                lte: endDate
            };
        }

        const specialHours = await prisma.studioSpecialHours.findMany({
            where,
            orderBy: { date: 'asc' }
        });

        return res.json(specialHours);

    } catch (error) {
        console.error('Error getting special hours:', error);
        return res.status(500).json({ error: 'Failed to get special hours' });
    }
}

// Set special hours for a specific date
// POST /api/studios/:studioId/special-hours
exports.setStudioSpecialHours= async(req, res)=> {
    try {
        const { studioId } = req.params;
        const { date, open_time, close_time, is_closed } = req.body;

        // Validate request
        if (!date || ((!open_time || !close_time) && !is_closed)) {
            return res.status(400).json({
                error: 'Missing required fields. Provide date and either open_time+close_time or is_closed=true'
            });
        }

        // Check if studio exists
        const studio = await prisma.studio.findUnique({
            where: { id: studioId }
        });

        if (!studio) {
            return res.status(404).json({ error: 'Studio not found' });
        }

        // Parse date
        const specialDate = new Date(date);

        // Format times
        let openTimeDate = null;
        let closeTimeDate = null;

        if (!is_closed) {
            // Parse time strings (format: HH:MM)
            const [openHour, openMinute] = open_time.split(':').map(Number);
            const [closeHour, closeMinute] = close_time.split(':').map(Number);

            // Create Date objects with time set
            openTimeDate = new Date();
            openTimeDate.setHours(openHour, openMinute, 0, 0);

            closeTimeDate = new Date();
            closeTimeDate.setHours(closeHour, closeMinute, 0, 0);

            if (openTimeDate >= closeTimeDate) {
                return res.status(400).json({ error: 'open_time must be earlier than close_time' });
            }
        }

        // Upsert special hours (create or update)
        const specialHours = await prisma.studioSpecialHours.upsert({
            where: {
                studio_id_date: {
                    studio_id: studioId,
                    date: specialDate
                }
            },
            update: {
                open_time: is_closed ? null : openTimeDate,
                close_time: is_closed ? null : closeTimeDate,
                is_closed: is_closed || false
            },
            create: {
                studio_id: studioId,
                date: specialDate,
                open_time: is_closed ? null : openTimeDate,
                close_time: is_closed ? null : closeTimeDate,
                is_closed: is_closed || false
            }
        });

        return res.json(specialHours);

    } catch (error) {
        console.error('Error setting special hours:', error);
        return res.status(500).json({ error: 'Failed to set special hours' });
    }
}

// Delete special hours for a specific date
// DELETE /api/studios/:studioId/special-hours/:date
exports.deleteStudioSpecialHours= async(req, res)=> {
    try {
        const { studioId, date } = req.params;
        const specialDate = new Date(date);

        await prisma.studioSpecialHours.delete({
            where: {
                studio_id_date: {
                    studio_id: studioId,
                    date: specialDate
                }
            }
        });

        return res.json({ success: true });

    } catch (error) {
        console.error('Error deleting special hours:', error);
        return res.status(500).json({ error: 'Failed to delete special hours' });
    }
}

/**
 * Recurring Pattern Management
 */

// Get recurring patterns for a studio
// GET /api/studios/:studioId/recurring-patterns
exports.getStudioRecurringPatterns= async(req, res)=> {
    try {
        const { studioId } = req.params;

        const recurringPatterns = await prisma.recurringPattern.findMany({
            where: { studio_id: studioId },
            orderBy: [
                { day_of_week: 'asc' },
                { start_date: 'asc' }
            ]
        });

        return res.json(recurringPatterns);

    } catch (error) {
        console.error('Error getting recurring patterns:', error);
        return res.status(500).json({ error: 'Failed to get recurring patterns' });
    }
}

// Create a recurring pattern
// POST /api/studios/:studioId/recurring-patterns
exports.createRecurringPattern= async(req, res)=> {
    try {
        const { studioId } = req.params;
        const {
            start_date,
            end_date,
            day_of_week,
            open_time,
            close_time,
            is_closed
        } = req.body;

        // Validate request
        if (!start_date || day_of_week === undefined || ((!open_time || !close_time) && !is_closed)) {
            return res.status(400).json({
                error: 'Missing required fields. Provide start_date, day_of_week, and either open_time+close_time or is_closed=true'
            });
        }

        if (day_of_week < 0 || day_of_week > 6) {
            return res.status(400).json({ error: 'day_of_week must be between 0 (Sunday) and 6 (Saturday)' });
        }

        // Check if studio exists
        const studio = await prisma.studio.findUnique({
            where: { id: studioId }
        });

        if (!studio) {
            return res.status(404).json({ error: 'Studio not found' });
        }

        // Parse dates
        const startDate = new Date(start_date);
        let endDate = null;

        if (end_date) {
            endDate = new Date(end_date);

            if (endDate <= startDate) {
                return res.status(400).json({ error: 'end_date must be after start_date' });
            }
        }

        // Format times
        let openTimeDate = null;
        let closeTimeDate = null;

        if (!is_closed) {
            // Parse time strings (format: HH:MM)
            const [openHour, openMinute] = open_time.split(':').map(Number);
            const [closeHour, closeMinute] = close_time.split(':').map(Number);

            // Create Date objects with time set
            openTimeDate = new Date();
            openTimeDate.setHours(openHour, openMinute, 0, 0);

            closeTimeDate = new Date();
            closeTimeDate.setHours(closeHour, closeMinute, 0, 0);

            if (openTimeDate >= closeTimeDate) {
                return res.status(400).json({ error: 'open_time must be earlier than close_time' });
            }
        }

        // Create recurring pattern
        const recurringPattern = await prisma.recurringPattern.create({
            data: {
                studio_id: studioId,
                start_date: startDate,
                end_date: endDate,
                day_of_week,
                open_time: is_closed ? null : openTimeDate,
                close_time: is_closed ? null : closeTimeDate,
                is_closed: is_closed || false
            }
        });

        return res.status(201).json(recurringPattern);

    } catch (error) {
        console.error('Error creating recurring pattern:', error);
        return res.status(500).json({ error: 'Failed to create recurring pattern' });
    }
}

// Update a recurring pattern
// PUT /api/studios/:studioId/recurring-patterns/:patternId
exports.updateRecurringPattern= async(req, res)=> {
    try {
        const { studioId, patternId } = req.params;
        const {
            start_date,
            end_date,
            day_of_week,
            open_time,
            close_time,
            is_closed
        } = req.body;

        // Check if pattern exists
        const existingPattern = await prisma.recurringPattern.findUnique({
            where: {
                id: patternId,
                studio_id: studioId
            }
        });

        if (!existingPattern) {
            return res.status(404).json({ error: 'Recurring pattern not found' });
        }

        // Prepare update data
        const updateData = {};

        if (start_date !== undefined) {
            updateData.start_date = new Date(start_date);
        }

        if (end_date !== undefined) {
            updateData.end_date = end_date ? new Date(end_date) : null;
        }

        if (day_of_week !== undefined) {
            if (day_of_week < 0 || day_of_week > 6) {
                return res.status(400).json({ error: 'day_of_week must be between 0 (Sunday) and 6 (Saturday)' });
            }
            updateData.day_of_week = day_of_week;
        }

        if (is_closed !== undefined) {
            updateData.is_closed = is_closed;

            if (is_closed) {
                updateData.open_time = null;
                updateData.close_time = null;
            }
        }

        if (!is_closed && (open_time !== undefined || close_time !== undefined)) {
            // Get current values for any missing time
            const currentOpenTime = open_time === undefined ? existingPattern.open_time : null;
            const currentCloseTime = close_time === undefined ? existingPattern.close_time : null;

            // Parse time strings (format: HH:MM)
            let openTimeDate = currentOpenTime;
            let closeTimeDate = currentCloseTime;

            if (open_time !== undefined) {
                const [openHour, openMinute] = open_time.split(':').map(Number);
                openTimeDate = new Date();
                openTimeDate.setHours(openHour, openMinute, 0, 0);
            }

            if (close_time !== undefined) {
                const [closeHour, closeMinute] = close_time.split(':').map(Number);
                closeTimeDate = new Date();
                closeTimeDate.setHours(closeHour, closeMinute, 0, 0);
            }

            if (openTimeDate && closeTimeDate && openTimeDate >= closeTimeDate) {
                return res.status(400).json({ error: 'open_time must be earlier than close_time' });
            }

            updateData.open_time = openTimeDate;
            updateData.close_time = closeTimeDate;
        }

        // Update the recurring pattern
        const updatedPattern = await prisma.recurringPattern.update({
            where: { id: patternId },
            data: updateData
        });

        return res.json(updatedPattern);

    } catch (error) {
        console.error('Error updating recurring pattern:', error);
        return res.status(500).json({ error: 'Failed to update recurring pattern' });
    }
}

// Delete a recurring pattern
// DELETE /api/studios/:studioId/recurring-patterns/:patternId
exports.deleteRecurringPattern= async(req, res)=> {
    try {
        const { studioId, patternId } = req.params;

        // Check if pattern exists
        const existingPattern = await prisma.recurringPattern.findUnique({
            where: {
                id: patternId,
                studio_id: studioId
            }
        });

        if (!existingPattern) {
            return res.status(404).json({ error: 'Recurring pattern not found' });
        }

        await prisma.recurringPattern.delete({
            where: { id: patternId }
        });

        return res.json({ success: true });

    } catch (error) {
        console.error('Error deleting recurring pattern:', error);
        return res.status(500).json({ error: 'Failed to delete recurring pattern' });
    }
}

/**
 * Studio Slot Management
 */

// Create or update slots based on availability settings
// POST /api/studios/:studioId/generate-slots
exports.generateStudioSlots= async(req, res)=> {
    try {
        const { studioId } = req.params;
        const { start_date, end_date, hourly_rate } = req.body;

        // Validate request
        if (!start_date || !end_date || !hourly_rate) {
            return res.status(400).json({
                error: 'Missing required fields. Provide start_date, end_date, and hourly_rate'
            });
        }

        // Parse dates
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (endDate <= startDate) {
            return res.status(400).json({ error: 'end_date must be after start_date' });
        }

        // Check if studio exists
        const studio = await prisma.studio.findUnique({
            where: { id: studioId }
        });

        if (!studio) {
            return res.status(404).json({ error: 'Studio not found' });
        }

        // Get studio's default hours
        const defaultHours = await prisma.studioDefaultHours.findMany({
            where: { studio_id: studioId }
        });

        // Get studio's special hours for this period
        const specialHours = await prisma.studioSpecialHours.findMany({
            where: {
                studio_id: studioId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        // Get recurring patterns that overlap with this period
        const recurringPatterns = await prisma.recurringPattern.findMany({
            where: {
                studio_id: studioId,
                OR: [
                    {
                        start_date: { lte: endDate },
                        end_date: null
                    },
                    {
                        start_date: { lte: endDate },
                        end_date: { gte: startDate }
                    }
                ]
            }
        });

        // Default business hours (if no specific settings are found)
        const openingHour = 7; // 7 AM
        const closingHour = 22; // 10 PM

        // Array to store all slots to be created
        const slotsToCreate = [];

        // Generate slots for each day in the date range
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const formattedDate = formatDate(currentDate);
            const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

            // Check special hours first
            const specialDay = specialHours.find(sh => formatDate(sh.date) === formattedDate);

            // Check recurring patterns next
            const applicablePatterns = recurringPatterns.filter(pattern => {
                const patternStartDate = new Date(pattern.start_date);
                const patternEndDate = pattern.end_date ? new Date(pattern.end_date) : null;

                return (
                    pattern.day_of_week === dayOfWeek &&
                    patternStartDate <= currentDate &&
                    (!patternEndDate || patternEndDate >= currentDate)
                );
            });

            // Sort patterns by start date (descending) to get most recent pattern
            applicablePatterns.sort((a, b) =>
                new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
            );

            const mostRecentPattern = applicablePatterns.length > 0 ? applicablePatterns[0] : null;

            // Check default hours last
            const defaultDay = defaultHours.find(dh => dh.day_of_week === dayOfWeek);

            // Determine if the studio is closed on this day
            let isClosed = false;

            if (specialDay) {
                isClosed = specialDay.is_closed;
            } else if (mostRecentPattern) {
                isClosed = mostRecentPattern.is_closed;
            } else if (defaultDay) {
                isClosed = defaultDay.is_closed;
            }

            // Skip if studio is closed
            if (isClosed) {
                // Go to next day
                currentDate.setDate(currentDate.getDate() + 1);
                continue;
            }

            // Determine open and close hours
            let studioOpenHour = openingHour;
            let studioCloseHour = closingHour;

            if (specialDay && specialDay.open_time && specialDay.close_time) {
                studioOpenHour = specialDay.open_time.getHours();
                studioCloseHour = specialDay.close_time.getHours();
            } else if (mostRecentPattern && mostRecentPattern.open_time && mostRecentPattern.close_time) {
                studioOpenHour = mostRecentPattern.open_time.getHours();
                studioCloseHour = mostRecentPattern.close_time.getHours();
            } else if (defaultDay && !defaultDay.is_closed && defaultDay.open_time && defaultDay.close_time) {
                studioOpenHour = defaultDay.open_time.getHours();
                studioCloseHour = defaultDay.close_time.getHours();
            }

            // Generate hourly slots
            for (let hour = studioOpenHour; hour < studioCloseHour; hour++) {
                const startTime = new Date(currentDate);
                startTime.setHours(hour, 0, 0, 0);

                const endTime = new Date(currentDate);
                endTime.setHours(hour + 1, 0, 0, 0);

                slotsToCreate.push({
                    studio_id: studioId,
                    date: new Date(currentDate),
                    start_time: startTime,
                    end_time: endTime,
                    is_available: true,
                    price: hourly_rate
                });
            }

            // Go to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Create all slots in a transaction
        const result = await prisma.$transaction(async (prisma) => {
            // Delete existing slots in this date range
            await prisma.studioSlot.deleteMany({
                where: {
                    studio_id: studioId,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            });

            // Create new slots
            for (const slotData of slotsToCreate) {
                await prisma.studioSlot.create({
                    data: slotData
                });
            }

            return { success: true, slotsCreated: slotsToCreate.length };
        });

        return res.json(result);

    } catch (error) {
        console.error('Error generating studio slots:', error);
        return res.status(500).json({ error: 'Failed to generate studio slots' });
    }
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

