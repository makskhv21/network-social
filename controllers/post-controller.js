const { prisma } = require('../prisma/prisma-client');

const PostController = {
    createPost: async (req, res) => {
        const { content } = req.body; // отримуємо контент поста з тіла запиту
        const authorId = req.user.userId; // отримуємо id користувача, який створює пост
      
        if (!content) { // якщо контент відсутній, повертаємо помилку
          return res.status(400).json({ error: 'Всі поля обовязкові' });
        }
      
        try {
          const post = await prisma.post.create({
            data: {
              content, // додаємо контент
              authorId, // вказуємо id автора
            },
          });
      
          res.json(post); // повертаємо створений пост
        } catch (error) {
          console.error("Error in createPost:", error); // логуємо помилку
      
          res.status(500).json({ error: 'There was an error creating the post' }); // повертаємо помилку, якщо не вдалося створити пост
        }
    },

    getAllPosts: async (req, res) => {
        const userId = req.user.userId; // отримуємо id користувача
      
        try {
          const posts = await prisma.post.findMany({
            include: {
              likes: true, // додаємо інформацію про лайки
              author: true, // додаємо інформацію про автора
              comments: true // додаємо інформацію про коментарі
            },
            orderBy: {
              createdAt: 'desc' // сортуємо пости за датою створення (найновіші першими)
            }
          });
      
          const postsWithLikeInfo = posts.map(post => ({
            ...post,
            likedByUser: post.likes.some(like => like.userId === userId) // перевіряємо, чи лайкав цей пост поточний користувач
          }));
      
          res.json(postsWithLikeInfo); // повертаємо всі пости з додатковою інформацією про лайки
        } catch (err) {
          res.status(500).json({ error: 'Произошла ошибка при получении постов' }); // якщо помилка, повертаємо її
        }
    },

    getPostById: async (req, res) => {
        const { id } = req.params; // отримуємо id поста з параметрів запиту
        const userId = req.user.userId; // отримуємо id користувача
      
        try {
          const post = await prisma.post.findUnique({
            where: { id }, // шукаємо пост за його id
            include: {
              comments: { include: { user: true } }, // додаємо коментарі з користувачами
              likes: true, // додаємо лайки
              author: true // додаємо інформацію про автора
            },
          });
      
          if (!post) { // якщо пост не знайдений
            return res.status(404).json({ error: 'Пост не найден' });
          }
      
          const postWithLikeInfo = {
            ...post,
            likedByUser: post.likes.some(like => like.userId === userId) // перевіряємо, чи лайкав цей пост поточний користувач
          };
      
          res.json(postWithLikeInfo); // повертаємо пост з додатковою інформацією
        } catch (error) {
          res.status(500).json({ error: 'Помилка про отримання поста' }); // повертаємо помилку, якщо щось пішло не так
        }
    },

    deletePost: async (req, res) => {
        const { id } = req.params; // отримуємо id поста з параметрів запиту
      
        const post = await prisma.post.findUnique({ where: { id } }); // шукаємо пост в базі даних
      
        if (!post) { // якщо пост не знайдений
          return res.status(404).json({ error: "Пост не знайдений" });
        }
      
        if (post.authorId !== req.user.userId) { // перевіряємо, чи є користувач автором поста
          return res.status(403).json({ error: "Немає доступа" }); // якщо ні, відмовляємо в доступі
        }
      
        try {
          const transaction = await prisma.$transaction([ // створюємо транзакцію для видалення
            prisma.comment.deleteMany({ where: { postId: id } }), // видаляємо всі коментарі до поста
            prisma.like.deleteMany({ where: { postId: id } }), // видаляємо всі лайки до поста
            prisma.post.delete({ where: { id } }), // видаляємо сам пост
          ]);
      
          res.json(transaction); // повертаємо результат транзакції (видалені записи)
        } catch (error) {
          res.status(500).json({ error: 'Щось пішло не так' }); // якщо щось пішло не так, повертаємо помилку
        }
    }
};

module.exports = PostController