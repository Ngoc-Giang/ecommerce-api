const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { username, password, fullname } = req.body;

    if (!username || !password || !fullname) {
      return res.status(400).json({
        success: false,
        message: "username, password and fullname are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        fullname,
        roleid: 1,
        mid: 1,
      },
    });

    res.status(201).json({
      success: true,
      message: "Register successfully",
      data: {
        uid: user.uid,
        username: user.username,
        fullname: user.fullname,
        roleid: user.roleid,
        mid: user.mid,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to register",
    });
  }
};




const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      { uid: user.uid, username: user.username, roleid: user.roleid },
      process.env.JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login successfully",
      data: {
        uid: user.uid,
        username: user.username,
        token,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
};

module.exports = {
  register,
  login,
};