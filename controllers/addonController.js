const prisma = require("../database/prismaPostgress");

module.exports.createAddon = async (req, res)=>{
  try {
    const {
      studioId,
      name,
      description,
      price,
      category,
      imageUrl,
      availability,
      isActive,
    } = req.body;

    const newAddon = await prisma.addon.create({
      data: {
        studioId,
        name,
        description,
        price,
        category,
        imageUrl,
        availability,
        isActive: isActive ?? true,
      },
    });

    res.status(201).json(newAddon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all addons with optional filters
module.exports.getAllAddons = async (req, res) => {
  try {
    const { studioId, category, isActive } = req.query;

    const addons = await prisma.addon.findMany({
      where: {
        ...(studioId && { studioId: parseInt(studioId) }),
        ...(category && { category }),
        ...(isActive && { isActive: isActive === 'true' }),
      },
    });

    res.status(200).json(addons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getAddonsByStudioId = async (req, res) => {
  try {
    const { studioId } = req.params;

    if (!studioId) {
      return res.status(400).json({ error: "Studio ID is required" });
    }

    const addons = await prisma.addon.findMany({
      where: {
        studioId: parseInt(studioId), // Ensure studioId is parsed as an integer
      },
    });

    if (!addons || addons.length === 0) {
      return res.status(404).json({ message: "No addons found for this studio" });
    }

    res.status(200).json(addons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get a single addon by ID
module.exports.getAddonById = async (req, res) => {
  try {
    const { id } = req.params;

    const addon = await prisma.addon.findUnique({
      where: { id: parseInt(id) },
    });

    if (!addon) {
      return res.status(404).json({ error: 'Addon not found' });
    }

    res.status(200).json(addon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an addon
module.exports.updateAddon = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updatedAddon = await prisma.addon.update({
      where: { id: parseInt(id) },
      data,
    });

    res.status(200).json(updatedAddon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an addon
module.exports.deleteAddon = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.addon.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Addon deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search addons by name
module.exports.searchAddons = async (req, res) => {
  try {
    const { query } = req.query;

    const addons = await prisma.addon.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
    });

    res.status(200).json(addons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update addon status (active/inactive)
module.exports.updateAddonStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const updatedAddon = await prisma.addon.update({
      where: { id: parseInt(id) },
      data: { isActive },
    });

    res.status(200).json(updatedAddon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get addon availability
module.exports.getAddonAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const addon = await prisma.addon.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, name: true, availability: true },
    });

    if (!addon) {
      return res.status(404).json({ error: 'Addon not found' });
    }

    res.status(200).json(addon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update addon availability
module.exports.updateAddonAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;

    const updatedAddon = await prisma.addon.update({
      where: { id: parseInt(id) },
      data: { availability },
    });

    res.status(200).json(updatedAddon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.toggleAddonStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Addon ID is required" });
    }

    // Find the current status of the addon
    const addon = await prisma.addon.findUnique({
      where: { id: parseInt(id) },
    });

    if (!addon) {
      return res.status(404).json({ error: "Addon not found" });
    }

    // Toggle the `isActive` status
    const updatedAddon = await prisma.addon.update({
      where: { id: parseInt(id) },
      data: { isActive: !addon.isActive },
    });

    res.status(200).json({
      message: `Addon status updated successfully.`,
      addon: updatedAddon,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Filter addons by price range
module.exports.filterAddonsByPrice = async (req, res) => {
  try {
    const { minPrice, maxPrice } = req.query;

    const addons = await prisma.addon.findMany({
      where: {
        price: {
          gte: parseFloat(minPrice),
          lte: parseFloat(maxPrice),
        },
      },
    });

    res.status(200).json(addons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
