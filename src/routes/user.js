const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Models
const User = require('../models/User');

// 관리자 계정 회원가입
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

// 관리자 계정 로그인
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // password 항목을 추가로 가지고 온다.
    const user = await User.findOne({ username }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "사용자를 찾을 수 없습니다."});
    }

    // 계정이 잠겨진 상태인 경우 401 응답.
    if (!user.isActive) {
      return res.status(401).json({ message: "비활성화된 계정입니다. 관리자에게 문의하세요."});
    }

    // 로그인 상태인 경우
    if (user.isLoggedIn) {
      return res.status(401).json({ message: "이미 다른 기기에서 로그인이 되어있습니다."});
    }

    // 암호화된 비밀번호가 동일한지 비교
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      user.failedLoginAttempts += 1;
      user.lastLoginAttempt = new Date();

      // 비밀번호를 5회 이상 틀렸을 시 계정 잠굼
      if (user.failedLoginAttempts >= 5) {
        user.isActive = false;
        await user.save();
        return res.status(401).json({ message: "비밀번호 5회 이상 틀려 계정이 비활성화 됩니다. "});
      }

      await user.save();
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다. ", data: { remainingAttempts: 5 - user.failedLoginAttempts } });
    }

    user.failedLoginAttempts = 0;
    user.lastLoginAttempt = new Date();
    user.isLoggedIn = true;

    try {
      // user의 ip주소를 받아오는 방법
      const response = await axios.get("https://api.ipify.org?format=json");
      const ipAddress = response.data.ip; // 공인 ip
      user.ipAddress = ipAddress;
    } catch (error) {
      console.log("IP 주소를 가져오던 중 오류 발생: ", error.message);
    }

    await user.save();

    // JWT 토큰 발급
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // 토큰 유효기간 설정
    );

    res.cookie('token', token, {
      httpOnly: true,               // 클라이언트(JavaScript)에서 해당 쿠키에 접근 할 수 없도록 설정
      secure: 'production',         // Https 연결에서만 쿠키를 전송하도록 설정 (서버가 운영환경에서만 Secure 옵션 활성화)
      sameSite: 'strict',           // 외부 사이트에서의 요청에 대해 쿠키를 전송하지 않도록 설정
      maxAge: 24 * 60 * 60 * 1000   // 쿠키의 만료 시간 설정
    });

    const userWithoutPassword = user.toObject();  // mongoDB 객체를 일반 객체로 변환
    delete userWithoutPassword.password;

    return res.status(200).json({ message: "로그인 성공", data: { user : userWithoutPassword } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다. "});
  }
});

// 관리자 계정 로그아웃
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies.token;

    // 토큰이 존재하지 않는 경우 이미 로그아웃된 계정으로 판단.
    if (!token) {
      return res.status(400).json({ message: '이미 로그아웃된 상태입니다. '});
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (user) {
        user.isLoggedIn = false;
        await user.save();
      }
    } catch (error) {
      console.log("토큰 검증 오류: ", error.message);
      // return res.status(400).json({ message: "토큰 검증 오류" });
    }

    res.clearCookie('token', {
      httpOnly: true,
      secure: 'production',
      sameSite: 'strict',
    });

    res.json({ message: "로그아웃 되었습니다."})
  } catch (error) {
    console.log("로그아웃 오류: ", error.message);
    res.status(500).json({ message: "서버 오류가 발생했습니다."});
  }
});

// 관계자 계정 삭제
router.delete('/delete/:userId', async (req, res) => {
  try {
    // DB에서 삭제를 하는 것이 아닌 deletedAt 컬럼을 생성하여 비활성화 하도록 수정
    const user = await User.findByIdAndDelete(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    return res.status(200).json({ message: "사용자가 성공적으로 삭제되었습니다." });
  } catch (error) {
    res.status(500).json({ message: "서버 오류가 발생했습니다." })
  }
});

module.exports = router;