const prisma = require('../database/prismaPostgress');

const getReviewsByStudioId = async (req, res) => {
  const { studioId } = req.params;
  try {
    const reviews = await prisma.review.findMany({
      where: { studio_id: parseInt(studioId) },
      include: {
        // created_at:true,
        user: {
          select: { 
            name: true,
           },
        },
      },
    });
    res.json(reviews);
  } 
  catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

const createReview = async (req, res)=> {
  const { studioId } = req.params;
  console.log("studio Id is ",studioId)
  const { userId, rating, comment } = req.body;
  try {
    const review = await prisma.review.create({
      data: {
        user_id: parseInt(userId),
        studio_id: parseInt(studioId),
        rating,
        comment,
      },
    });
    res.status(201).json(review);
  } 
  catch (error) {
    console.log(error )
    res.status(500).json({ error: 'Failed to create review' });
  }
};

const updateReview = async (req, res) => {
  const { studioId } = req.params;
  const { userId, rating, comment } = req.body;
  try {
    const existingReview = await prisma.review.findFirst({
      where: {
        user_id: parseInt(userId),
        studio_id: parseInt(studioId),
      },
    });

    if (!existingReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const review = await prisma.review.update({
      where: { id: existingReview.id },
      data: {
        rating,
        comment,
      },
    });
    res.json(review);
  } 
  catch (error) {
    res.status(500).json({ error: 'Failed to update review' });
  }
};

const hasRatedAlready = async (req,res)=>{

}

module.exports = {
  getReviewsByStudioId,
  createReview,
  updateReview,
};
