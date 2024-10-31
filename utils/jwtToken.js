const jwt = require("jsonwebtoken")

const createJWTToken = (id) => {
    const maxAge = 3 * 60 * 60 * 24;
    return jwt.sign({ id }, 'secretKey', {
        expiresIn: maxAge
    });
};

module.exports = createJWTToken