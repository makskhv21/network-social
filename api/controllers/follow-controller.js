const { prisma } = require("../prisma/prisma-client");

const FollowController = {
  followUser: async (req, res) => {
    const { followingId } = req.body;
    const userId = req.user.userId;

    if (followingId === userId) {
      return res.status(500).json({ message: 'Ви не можете підписатися на самого себе' });
    }

    try {
      const existingSubscription = await prisma.follows.findFirst({
        where: {
           AND: [
             {
               followerId: userId
             },
             {
               followingId
             }
           ]
        }
       })

      if (existingSubscription) {
        return res.status(400).json({ message: 'Підписка вже існує' });
      }

      await prisma.follows.create({
        data: {
          follower: { connect: { id: userId } },
          following: { connect: { id: followingId } },
        },
      });

      res.status(201).json({ message: 'Підпсика створена успішно' });
    } catch (error) {
      console.log('error', error)
      res.status(500).json({ error: 'Помилка сервера' });
    }
  },
  unfollowUser: async (req, res) => {
    const { followingId } = req.body;
    const userId = req.user.userId;

    try {
      const follows = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId: followingId }]
        },
      });

      if (!follows) {
        return res.status(404).json({ error: "Запис не знайдений" });
      }

      await prisma.follows.delete({
        where: { id: follows.id },
      });

      res.status(200).json({ message: 'Відписка успішно пройшла' });
    } catch (error) {
      console.log('error', error)
      res.status(500).json({ error: 'Помилка сервера' });
    }
  }
};

module.exports = FollowController;