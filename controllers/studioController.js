const prisma= require('../database/prismaPostgress');
const multer = require("multer");

const getStudios = async (req, res) => {
  console.log("Reached get studios controller");
  
  try {
    const studio = await prisma.studio.findMany({
      include: {
        // Amenities: true,
        photos: true, // Include photos related to each studio
      }
    });
    res.json(studio);
  } catch (error) {
    console.error("Error fetching studios:", error);
    res.status(500).json({ error: 'Failed to fetch studios' });
  } 
};

const getStudioById = async (req, res) => {
  const {studio_id} = req.params;
  try {
    const studio = await prisma.studio.findUnique({
      where: { id: parseInt(studio_id) },
      include: {
        photos:true
      }
    });
    if (!studio) {
      return res.status(404).json({ error: 'Studio not found' });
    }
    res.json(studio);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to fetch studio' });
  }
};

const createStudio = async (req, res) => {
  try {
    const { userId, name, description, hourly_rate, maxPeople, minDuration, studioType, size, address } = req.body;

    // Step 1: Create the Studio
    const newStudio = await prisma.studio.create({
      data: {
        host_id: userId,
        name,
        description,
        hourly_rate,
        max_people: maxPeople,
        min_duration: minDuration,
        studio_type: studioType,
        size, 
      },
    });

    // Step 2: Create the Address associated with the Studio
    const newAddress = await prisma.address.create({
      data: {
        studio_id: newStudio.id,
        address: address.address,
        city: address.city,
        state: address.state,
        country: address.country,
        pincode: address.pincode,
        latitude: address.latitude,
        longitude: address.longitude,
      },
    });

    return res.status(201).json({
      message: 'Studio and address created successfully',
      studio: newStudio,
      address: newAddress,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creating studio', error: error.message });
  }
};

const updateStudio = async (req, res) => {
  const { studio_id } = req.params;
  console.log("studio_id is ", studio_id);
  const { userId, name, description, minDuration, maxPeople, hourly_rate,  } = req.body;
  try {
    const dataToUpdate = {
      host_id: userId,
      name,
      description,
      min_duration:minDuration,
      max_people:maxPeople,
      hourly_rate,
      size,
    };
    // Check if amenities is present in the request body
    if (amenities && Array.isArray(amenities) && amenities.length > 0) {
      dataToUpdate.Amenities = {
        deleteMany: {}, // Clear existing amenities in the database
        create: amenities.map(amenity => ({ name: amenity }))
      };
    }
    const studio = await prisma.studio.update({
      where: { id: parseInt(studio_id) },
      data: dataToUpdate,
    });
    res.json(studio);
  } catch (error) {
  console.log(error);
    res.status(500).json({ error: 'Failed to update studio' });
  }
};

const deleteStudio = async (req, res) => {
  const { studio_id } = req.params;
  try {
    // Delete related entries in the StudioAmenity join table
    await prisma.studioAmenity.deleteMany({
      where: { studio_id: parseInt(studio_id) },
    });
    
    // Then delete the studio
    await prisma.studio.delete({
      
      where: { id: parseInt(studio_id) },
    });

    res.json({ message: 'Studio and related records deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to delete studio' });
  }
};

const searchStudios = async (req,res)=>{

  console.log(req.body)
  console.log("reached studio search function")
  const {studioType, city, date, startTime, endTime} = req.body.searchData;
    try {
        const startDateTime = new Date(`${date}T${startTime}:00`);
        const endDateTime = new Date(`${date}T${endTime}:00`);
        console.log("start date is",startDateTime)
        
        const studios = await prisma.studio.findMany({
          where: {
            studio_type: studioType,  // You can dynamically use studio_type from the request body
            address: {
              city: city         // Similarly, use city dynamically from request body
            },
            bookings: {
              none: {
                OR: [
                  {
                    start_time: {
                      lte: startDateTime  // Make sure this date is valid
                    },
                    end_time: {
                      gte: endDateTime    // Make sure this date is valid
                    }
                  }
                ]
              }
            }
          },
          include: {
            address: true,
            amenities: true,
            photos: true
          }
        });
        res.json({studios})

    } catch (error) {
        console.error('Error searching studios:', error);
        throw error;
    }
}

const setAvailability = async(req,res)=>{
  const studioId = req.params["studio_id"]
  const {weekDay,startTime,endTime,isRecurring} = req.body;
  try{
    const response = await prisma.availability.create({
      studio_id : studioId,
      day_of_week : weekDay,
      start_time : startTime,
      end_time : endTime,
      is_recurring : isRecurring
    })
    res.status(200).json({"msg":"Availability added sucessfully",response})
  }
  catch(err){
    res.status(500).json({"err":err})
  }
}


module.exports = {
  getStudios,
  getStudioById,
  createStudio,
  updateStudio,
  deleteStudio,
  searchStudios,
  setAvailability
};
