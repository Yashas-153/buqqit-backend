const prisma = require('../database/prismaPostgress');

// Function to add a new equipment
const addEquipment = async (req, res) => {
    const studioId = parseInt(req.params.studio_id);
    console.log("studio Id is ", studioId);
    const { name,description,icon_url} = req.body;

    try {
        const response = await prisma.equipment.create({
            data: {
                studio_id: studioId,
                name,
                description,
                icon_url,
            },
        });
        res.json(response);
    } catch (error) {
        console.error("Error creating equipment:", error);
        res.status(500).json({ error: "Failed to create equipment" });
    }
};

// Function to get all equipments by studio ID
const getAllEquipmentsByStudioId = async (req, res) => {
    const studioId = parseInt(req.params.studio_id);

    try {
        const response = await prisma.equipment.findMany({
            where: { studio_id: studioId },
        });
        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching equipments:", error);
        res.status(500).json({ error: "Failed to fetch equipments" });
    }
};

// Function to update an equipment by ID
const updateEquipment = async (req, res) => {
    const equipmentId = parseInt(req.params.id);
    const { name, price, available } = req.body;

    try {
        const response = await prisma.equipment.update({
            where: { id: equipmentId },
            data: {
                name,
                price,
                available,
            },
        });

        res.json(response);
    } catch (error) {
        console.error("Error updating equipment:", error);
        res.status(500).json({ error: "Failed to update equipment" });
    }
};

module.exports = { 
    addEquipment, 
    getAllEquipmentsByStudioId, 
    updateEquipment 
};
