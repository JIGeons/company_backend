const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

// Models
const User = require('../models/User');

router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 존재하는 user인지 확인
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "이미 존재하는 사용자입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // 원본 password값을 10진수 암호화 진행

    const user = new User({
      username,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({
      message: "회원가입이 완료되었습니다."
    })
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.'})
    console.log(error);
  }
});

module.exports = router;