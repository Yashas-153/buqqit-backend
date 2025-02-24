const {Router} = require('express')
const addonController = require('../controllers/addonController')
 // Assuming the controller is in the "controllers" folder

const router = Router()
// Create a new addon
router.post("/", addonController.createAddon);

// Get all addons
router.get("/", addonController.getAllAddons);

// Get a single addon by ID
router.get("/:id", addonController.getAddonById);

// Get all addons for a specific studio
router.get("/studio/:studioId", addonController.getAddonsByStudioId);

// Update an addon by ID
router.put("/:id", addonController.updateAddon);

// Delete an addon by ID
router.delete("/:id", addonController.deleteAddon);

// Toggle the isActive status of an addon
router.patch("/:id/toggle-status", addonController.toggleAddonStatus);

module.exports = router;
