const { prisma } = require('../prisma/prisma-client');

const CommentController = {
    createComment: async (req, res) => {
        try {
          const { postId, content } = req.body; // Отримуємо ID поста та текст коментаря з тіла запиту
          const userId = req.user.userId; // Отримуємо ID користувача, який пише коментар
      
          // Перевіряємо, чи були вказані всі необхідні поля (ID поста та текст коментаря)
          if (!postId || !content) {
            return res.status(400).json({ error: 'Всі поля обовязкові' }); // Якщо не вказані — повертаємо помилку
          }
      
          // Створюємо новий коментар у базі даних
          const comment = await prisma.comment.create({
            data: {
              postId,   // Прив'язуємо коментар до конкретного поста
              userId,   // Вказуємо ID користувача, який створює коментар
              content   // Додаємо текст коментаря
            },
          });
      
          // Повертаємо створений коментар як відповідь
          res.json(comment);
        } catch (error) {
          console.error('Error creating comment:', error);
          res.status(500).json({ error: 'Не вдалося видалити коментар' });
        }
    },

    deleteComment: async (req, res) => {
        try {
          const { id } = req.params; // Отримуємо ID коментаря з параметрів запиту
          const userId = req.user.userId; // Отримуємо ID користувача, який хоче видалити коментар
      
          // Перевіряємо, чи існує коментар у базі даних
          const comment = await prisma.comment.findUnique({ where: { id } });
      
          if (!comment) { // Якщо коментар не знайдений
            return res.status(404).json({ error: 'Комментарий не найден' }); // Повертаємо помилку
          }
      
          // Перевіряємо, чи є поточний користувач автором коментаря
          if (comment.userId !== userId) {
            return res.status(403).json({ error: 'Ви не авторизовані для видалення цього коментаря' }); // Якщо не автор — повертаємо помилку доступу
          }
      
          // Видаляємо коментар з бази даних
          await prisma.comment.delete({ where: { id } });
      
          // Повертаємо видалений коментар як підтвердження
          res.json(comment);
        } catch (error) {
          console.error('Error deleting comment:', error);
          res.status(500).json({ error: 'Не вдалося видалити коментарі' });
        }
    }      
};


module.exports = CommentController