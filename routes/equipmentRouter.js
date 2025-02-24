const express = require("express")
const {
        addEquipment,
        updateEquipment,
        getAllEquipmentsByStudioId
    } = require("../controllers/equipmentController")

const router = express.Router()

router.post("/:studio_id",addEquipment)
router.get("/:studio_id",getAllEquipmentsByStudioId)

module.exports= router
