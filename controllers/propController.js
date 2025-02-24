const prisma = require('../database/prismaPostgress');

// Function to add a new prop
const addProp = async (req, res) => {
    const studioId = parseInt(req.params.studio_id);
    console.log("studio Id is ", studioId);
    const { name, description,icon_url } = req.body;

    try {
        const response = await prisma.prop.create({
            data: {
                name,
                description,
                icon_url,
                studio_id: studioId,
            },
        });
        res.json(response);
    } catch (error) {
        console.error("Error creating prop:", error);
        res.status(500).json({ error: "Failed to create prop" });
    }
};

// Function to get all props by studio ID
const getAllPropsByStudioId = async (req, res) => {
    const studioId = parseInt(req.params.studio_id);

    try {
        const response = await prisma.props.findMany({
            where: { studio_id: studioId },
        });

        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching props:", error);
        res.status(500).json({ error: "Failed to fetch props" });
    }
};

// Function to update a prop by ID
const updateProp = async (req, res) => {
    const propId = parseInt(req.params.id);
    const { name, price, available } = req.body;

    try {
        const response = await prisma.props.update({
            where: { id: propId },
            data: {
                name,
                price,
                available,
            },
        });

        res.json(response);
    } catch (error) {
        console.error("Error updating prop:", error);
        res.status(500).json({ error: "Failed to update prop" });
    }
};

module.exports = { addProp, getAllPropsByStudioId, updateProp };
