const prisma = require('../database/prismaPostgress');

const isHost = async (req, res, next) => {
  // console.log(req.body.userId)
  const userId = parseInt(req.body.userId); // Assuming user_id is passed in the request body
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if(user && user.user_type === 'HOST') {
      next();
    } 
    else{
      res.status(403).json({ error: 'Access forbidden: Hosts only' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify user type' });
  }
};

const isUser = async (req, res, next) => {
  // console.log(req.body.userId)
  const { userId } = req.body; // Assuming user_id is passed in the request body
  console.log("userId is ",userId)
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if(user && user.user_type === 'USER') {
      next();
    } 
    else{
      res.status(403).json({ error: 'Access forbidden: User only' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify user type' });
  }
};
module.exports = {isHost,isUser};
