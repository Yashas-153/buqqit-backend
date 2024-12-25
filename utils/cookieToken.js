const createJWTToken = require('./jwtToken')

const sendCookieToken = (user,res)=>{
    const token = createJWTToken(user.id)
    const options = {
        expires: new Date(
            Date.now() + 3 * 24 * 60 * 60 * 1000
        ),
    }
    user.password = undefined
    res.status(200).cookie('token',token, options).json({
        success:true,
        token,
        user
    });
}

module.exports = sendCookieToken