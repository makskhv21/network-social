const { prisma } = require("../prisma/prisma-client");
const bcrypt = require("bcryptjs");
const Jdenticon = require("jdenticon");
const path = require('path');
const fs = require('fs');
const jwt = require("jsonwebtoken");
require("dotenv");

const UserController = {
    register: async (req, res) => {
        const {email, password, name } = req.body;

        if (!email || !password || !name ) {
            return res.status(400).json({error: "Всі поля обовязкові"})
        }

        try { 
            const existingUser = await prisma.user.findUnique(({ where: { email }}));

            if (existingUser) {
                return res.status(400).json({ error: "Користувач вже існує"})
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const png = Jdenticon.toPng(name, 200);
            const avatarName = `${name}_${Date.now()}.png`;
            const avatarPath = path.join(__dirname, "../uploads", avatarName);
            fs.writeFileSync(avatarPath, png);

            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    avatarUrl: `/uploads/${avatarPath}`
                }
            });

            res.json(user);
        } catch(error) {
            console.error('Error in register', error);
            res.status(500).json({error: "INternal server error"});
        }
    },
    
    login: async (req, res) => {
        const {email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({error: "Всі поля обовязкові"});
        }

        try { 
            const user = await prisma.user.findUnique({ where: {email}});
            
            if (!user) {
                return res.status(400).json({error: "Неправильний пароль"});
            }

            const  valid = await bcrypt.compare(password, user.password);

            if (!valid) {
                return res.status(400).json({error: "Неправильний логін або пароль"})
            }

            const token = jwt.sign(({ userId: user.Id }), process.env.SECRET_KEY);
            res.json({ token });
        
        } catch (error) {
            console.error('Login error', error);
            res.status(500).json({ error: 'Internal server error'})
        }
    },

    getUserById: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.userId;
    
        try {
          const user = await prisma.user.findUnique({
            where: { id },
            include: {
              followers: true,
              following: true
            }
        });
    
        if (!user) {
            return res.status(404).json({ error: "Користувача не знайдено" });
        }
    
        const isFollowing = await prisma.follows.findFirst({
            where: {
              AND: [
                { followerId: userId },
                { followingId: id }
              ]
            }
        });
    
          res.json({ ...user, isFollowing: Boolean(isFollowing) });
        } catch (error) {
          res.status(500).json({ error: "Щось пішло не так" });
        }
    },
    
    updateUser: async (req, res) => {
        const { id } = req.params;
        const { email, name, dateOfBirth, bio, location } = req.body;
    
        let filePath;
    
        if (req.file && req.file.path) {
          filePath =  req.file.path;
        }
    
        if (id !== req.user.userId) {
          return res.status(403).json({ error: "Немає доступа" });
        }
    
        try {
          if (email) {
            const existingUser = await prisma.user.findFirst({
              where: { email: email },
            });
        
            if (existingUser && existingUser.id !== parseInt(id)) {
              return res.status(400).json({ error: "Пошта вже використовується" });
            }
        }
    
        const user = await prisma.user.update({
            where: { id },
            data: {
              email: email || undefined,
              name: name || undefined,
              avatarUrl: filePath ? `/${filePath}` : undefined,
              dateOfBirth: dateOfBirth || undefined,
              bio: bio || undefined,
              location: location || undefined,
            },
          });
          res.json(user);
        } catch (error) {
          console.log('error', error)
          res.status(500).json({ error: "Щось пішло не так" });
        }
    },
    
    current: async (req, res) => {
        try {
          const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: {
              followers: {
                include: {
                  follower: true
                }
              },
              following: {
                include: {
                  following: true
                }
              }
            }
          });
    
          if (!user) {
            return res.status(400).json({ error: "Не вдалося знайти користувача" });
          }
    
          return res.status(200).json(user)
        } catch (error) {
          console.log('err', error)
          res.status(500).json({ error: "Щось пігло не так" });
        }
    },
}

module.exports = UserController;