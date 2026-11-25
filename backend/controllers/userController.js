import userModel from "../models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const UserController = {
  async register(req, res, next) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Hiányos adatok' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Rossz email formátum' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'A jelszónak legalább 8 karakter hosszúnak kell lennie' });
    }

    try {
      const emailUser = await userModel.getByEmail(email.trim().toLowerCase());

      if (emailUser) {
        return res.status(409).json({ message: 'Ez az email cím már foglalt' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await userModel.create({
        name,
        email: email.trim().toLowerCase(),
        password: hashedPassword
      });

      res.status(201).json(newUser);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Ez az email cím már létezik' });
      }
      next(error);
    }
  },

  async login(req, res, next) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Hiányzó email vagy jelszó' });
    }

    try {
      const user = await userModel.getByEmail(email.trim().toLowerCase());

      if (!user) {
        return res.status(401).json({ message: 'Hibás email vagy jelszó' });
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswordCorrect) {
        return res.status(401).json({ message: 'Hibás email vagy jelszó' });
      }

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

      await userModel.updateRefreshToken(user.id, refreshToken);

      const secureCookie = process.env.NODE_ENV === 'production';
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: secureCookie,
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
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
      next(error);
    }
  },

  async refreshToken(req, res, next) {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ message: 'Hiányzó refresh token' });
    }

    try {
      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
      const user = await userModel.getByRefreshToken(token);

      if (!user || user.id !== decoded.id) {
        return res.status(403).json({ message: 'Érvénytelen refresh token' });
      }

      const newAccessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
      );

      res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: 'Lejárt vagy érvénytelen refresh token' });
      }
      next(error);
    }
  },

  async logout(req, res, next) {
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
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
      };

      res.clearCookie('refreshToken', cookieOptions);
      res.status(200).json({ message: 'Sikeres kijelentkezés' });
    } catch (error) {
      next(error);
    }
  },

  async getProfile(req, res, next) {
    try {
      const user = await userModel.getById(req.user.id);

      if (!user) {
        return res.status(404).json({ message: 'Felhasználó nem található' });
      }

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

};

export default UserController;
