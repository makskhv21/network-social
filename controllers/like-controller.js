const { prisma } = require('../prisma/prisma-client');

const LikeController = {
  likePost: async (req, res) => {
    const { postId } = req.body;

    const userId = req.user.userId;

    if (!postId) {
      return res.status(400).json({ error: 'Всі поля обовязкові' });
    }

    try {
      const existingLike = await prisma.like.findFirst({
        where: { postId, userId },
      });

      if(existingLike) {
        return res.status(400).json({ error: 'Ви вже поставили лайк цьому посту' });
      }

      const like = await prisma.like.create({ 
        data: { postId, userId },
      });

      res.json(like);
    } catch (error) {
      res.status(500).json({ error: 'Щось пішло не так' });
    }
  },

  unlikePost: async (req, res) => {
    const { id } = req.params;

    const userId = req.user.userId;

    if (!id) {
      return res.status(400).json({ error: 'Ви вже поставили дізлайк цьому посту' });
    }

    try {
      const existingLike = await prisma.like.findFirst({
        where: { postId: id, userId },
      });

      if(!existingLike) {
        return res.status(400).json({ error: 'Лайк вже поставлений' });
      }

      const like = await prisma.like.deleteMany({
        where: { postId: id, userId },
      });

      res.json(like);
    } catch (error) {
      res.status(500).json({ error: 'Щось пішло не так' });
    }
  }
};

module.exports = LikeController