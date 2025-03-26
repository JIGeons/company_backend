const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const jwt = require('jsonwebtoken');

// next -> 미들웨어 함수로 제어를 전달하는 역할
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "토큰이 없습니다."});
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "유효하지 않은 토큰입니다."});
  }
}

/**
 * 문의 내용 추가
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message, status } = req.body;

    // 문의 글이기 때문에 내용검증은 따로 하지 않음
    const contact = new Contact({
      name, email, phone, message, status
    });

    await contact.save();
    res.status(201).json({ message: "문의가 성공적으로 등록되었습니다."})
  } catch(error) {
    console.log("### 문의 내용 추가 오류: ", error);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
});

/**
 * 문의 내용 조회
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1}); // -1: 최신순, 1: 오래된순
    res.json(contacts);
  } catch (error) {
    console.log("### 문의 내용 조회 오류: ", error);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
});

/**
 * 문의 내용 조회 (by contactId)
 */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "문의를 찾을 수 없습니다."});
    }

    res.json(contact);
  } catch (error) {
    console.log("### 문의 내용 조회(by contactId) 오류: ", error);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
});

/**
 * 문의 내용 수정
 */
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ message: "문의를 찾을 수 없습니다." });
    }

    res.json({ message: "문의 상태가 성공적으로 수정되었습니다." , contact });
  } catch (error) {
    console.log("### 문의 내용 수정 오류: ", error);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
});

/**
 * 문의 내용 삭제
 */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "문의를 찾을 수 없습니다." });
    }

    res.json({ message: "문의 상태가 성공적으로 삭제되었습니다." });
  } catch (error) {
    console.log("### 문의 내용 삭제 오류: ", error);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
})

module.exports = router;