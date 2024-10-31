const express = require("express")
const {getAllPropsByStudioId,
        addProp,
        updateProp
    } = require("../controllers/propController")

const router = express.Router()

router.post("/:studio_id",addProp)
router.get("/:studio_id",getAllPropsByStudioId)

module.exports= router
