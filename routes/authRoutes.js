const {Router} = require('express')
const authController = require('../controllers/authController')

const router = Router()

router.post("/signup",authController.signUp)
router.post("/signin",authController.signIn)
router.get('/verify-email', authController.verifyEmail); 
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);


module.exports = router