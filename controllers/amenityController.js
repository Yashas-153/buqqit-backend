const prisma = require('../database/prismaPostgress');

const createAmenity = async (req, res) => {
  const { name, iconUrl } = req.body;
  try {
    
    const amenity = await prisma.amenity.create({
      data: {
        name,
        icon_url: iconUrl,  // Ensure field name matches the schema
      },
    });
    res.status(201).json(amenity);
  } 
  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to create amenity' });
  }
};

const createAmenities = async (req, res) => {
  const { amenities } = req.body;
  // console.log(amenities)
  try {
    amenities.forEach(async(element) => {
      console.log(element)
      const amenity = await prisma.amenity.create({
        data: {
          name:element.name,
          icon_url: element.iconUrl,  // Ensure field name matches the schema
        },
      });
    });
    res.status(201).json({"msg":"added succesfully"});
  } 
  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to create amenity' });
  }
};

const getAmenities = async (req, res) => {
  try {
    const amenities = await prisma.amenity.findMany();
    res.json(amenities);
  } 
  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to fetch amenities' });
  }
};

const updateAmenity = async (req, res) => {
  const { amenityId } = req.params;
  const { name, iconUrl } = req.body;
  try {
    const amenity = await prisma.amenity.update({
      where: { id: parseInt(amenityId) },
      data: {
        name,
        icon_url: iconUrl,  // Ensure field name matches the schema
      },
    });
    res.json(amenity);
  } 
  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to update amenity' });
  }
};

const deleteAmenity = async (req, res) => {
  const { amenityId } = req.params;
  try {
    await prisma.amenity.delete({
      where: { id: parseInt(amenityId) },
    });
    res.status(204).send();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to delete amenity' });
  }
};

module.exports = {
  createAmenity,
  getAmenities,
  updateAmenity,
  createAmenities,
  deleteAmenity,
};
