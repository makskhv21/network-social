# Використовуємо образ дистрибутив лінукс Alpine з версією Node -14 Node.js
FROM node:19.5.0-alpine

# Вказуємо нашу робочу дерикторію
WORKDIR /app

# Копіюємо package.json і package-lock.json у контейнер.
COPY package*.json ./

# Встановлюємо залежності
RUN npm install

# Копіюємо додаток, що залишився, в контейнер
COPY . .

# Встановлюємо Prisma
RUN npm install -g prisma

# Генеруємо Prisma client
RUN prisma generate

# Копіюємо Prisma schema та URL бази даних у контейнер
COPY prisma/schema.prisma ./prisma/

# Відкриваємо порт 3000 у нашому контейнері
EXPOSE 3000

# Запускаємо сервер
CMD [ "npm", "start" ]