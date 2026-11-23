import userModel from "../models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const UserController = {
  async getAll(req, res) {
    try {
      const users = await userModel.getAll();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async getById(req, res) {
    const { id } = req.params;

    try {
      const user = await userModel.getById(id);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: 'Nincs ilyen felhasználó' });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async register(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Hiányos adatok' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Rossz email formátum' });
    }

    if (password.length < 8) {
      returnres.status(400).json({ error: 'Rövid jelszó' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const emailUser = await userModel.getByEmail(email);

      if (emailUser) {
        return res.status(409).json({ error: 'Foglalt email cím' });
      }

      const newUser = await userModel.create({
        name: name,
        email: email,
        password: hashedPassword
      });

      res.status(201).json(newUser);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        res.status(400).json({ error: 'Ez az email cím már létezik' });
        return;
      }
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async login(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400);
    }

    try {
      const user = await userModel.getByEmail(email);

      if (!user) {
        return res.status(404).json({ error: 'Nincs ilyen felhasználó' });
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswordCorrect) {
        return res.status(401).json({ error: 'Hibás email vagy jelszó' });
      }

      await userModel.updateLastLogin(user.id);

      const accessToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_ACCESS_SECRET,
        {
          expiresIn: '15m'
        }
      );

      const refreshToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_REFRESH_SECRET,
        {
          expiresIn: '7d'
        }
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 15 * 60 * 1000
      });

      res.status(200).json({
        'accessToken': accessToken,
        'user': {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}