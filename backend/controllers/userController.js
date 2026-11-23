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
      return res.status(400).json({ error: 'Rövid jelszó' });
    }

    try {
      const emailUser = await userModel.getByEmail(email);

      if (emailUser) {
        return res.status(409).json({ error: 'Foglalt email cím' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await userModel.create({
        name,
        email,
        password: hashedPassword
      });

      res.status(201).json(newUser);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Ez az email cím már létezik' });
      }
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Hiányzó email vagy jelszó' });
    }

    try {
      const user = await userModel.getByEmail(email);

      if (!user) {
        return res.status(401).json({ error: 'Hibás email vagy jelszó' });
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswordCorrect) {
        return res.status(401).json({ error: 'Hibás email vagy jelszó' });
      }

      await userModel.updateLastLogin(user.id);

      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
      );

      const refreshToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
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
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async refreshToken(req, res) {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ error: 'Hiányzó refresh token' });
    }

    try {
      const user = await userModel.getByRefreshToken(token);
      if (!user) {
        return res.status(403).json({ error: 'Érvénytelen refresh token' });
      }

      jwt.verify(token, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
        if (err || user.id !== decoded.id) {
          return res.status(403).json({ error: 'Lejárt vagy érvénytelen refresh token' });
        }

        const newAccessToken = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          process.env.JWT_ACCESS_SECRET,
          { expiresIn: '15m' }
        );

        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'Strict',
          maxAge: 15 * 60 * 1000
        });

        res.status(200).json({ accessToken: newAccessToken });
      });
    } catch (error) {
      console.error('Error refreshing token:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async logout(req, res) {
    const token = req.cookies?.refreshToken;

    try {
      if (token) {
        const user = await userModel.getByRefreshToken(token);
        if (user) {
          await userModel.updateRefreshToken(user.id, null);
        }
      }

      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict'
      };

      res.clearCookie('refreshToken', cookieOptions);
      res.clearCookie('accessToken', cookieOptions);

      res.status(200).json({ message: 'Sikeres kijelentkezés' });
    } catch (error) {
      console.error('Error during logout:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async getProfile(req, res) {
    try {
      const user = await userModel.getById(req.user.id);

      if (!user) {
        return res.status(404).json({ error: 'Felhasználó nem található' });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

};

export default UserController;
