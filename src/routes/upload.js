const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const express = require("express");
const router = express.Router();

// 파일 업로드할 때 사용되는 사용자 정보로 s3 객체 생성
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

// 이미지 최대 용량을 설정
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  }
});

// 파일 최대 용량을 설정
const fileUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  }
});

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(400).json({ message: "인증되지 않은 요청입니다." });
  }
  next();
};

/**
 * 이미지 업로드
 */
router.post('/image', verifyToken, imageUpload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    const fileExtension = file.originalname.split('.').pop();  // 파일 확장자 분리
    const fileName = `${uuidv4()}.${fileExtension}`;  // uuidv4 유니크한 파일 이름을 만들어 줌.

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `post-images/${fileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/post-images/${fileName}`;
    res.json({ imageUrl });
  } catch (error) {
    console.log("### 이미지 업로드 에러: ", error);
    res.status(500).json({ message: "이미지 업로드 중 에러가 발생하였습니다." });
  }
});

/**
 * 파일 업로드
 */
router.post('/file', verifyToken, fileUpload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const originalName = req.body.originalName;
    const decodedFileName = decodeURIComponent(originalName);

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `post-files/${decodedFileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(decodedFileName)}`,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/post-files/${decodedFileName}`;
    res.json({ fileUrl });
  } catch (error) {
    console.log("### 파일 업로드 에러: ", error);
    res.status(500).json({ message: "파일 업로드 중 에러가 발생하였습니다." });
  }
});

module.exports = router;