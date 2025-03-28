/**
 * post 라우터
 */

const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { marked } = require("marked");

// 파일 업로드할 때 사용되는 사용자 정보로 s3 객체 생성
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

/**
 * @param req
 * @param res
 * @param next
 * @returns {*}
 *
 * JWT 토큰의 유효성을 검증하는 미들웨어
 */
const authenticateToken = (req, res, next) => {
  // next -> 미들웨어 함수로 제어를 전달하는 역할
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
 *  게시글 전체 조회
 */
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.log("### 게시글 전체 조회 오류: ", error);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
});

/**
 *  특정 게시글 조회
 */
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    let ip;
    try {
      // user의 ip주소를 받아오는 방법
      const response = await axios.get("https://api.ipify.org?format=json");
      ip = response.data.ip; // 공인 ip

    } catch (error) {
      console.log("IP 주소를 가져오던 중 오류 발생: ", error.message);
      ip = req.ip;
    }

    const userAgent = req.headers["User-Agent"];
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    // 최근 24시간 내에 같은 user가 조회한 기록이 있는지 확인.
    const hasRecentView = post.viewLogs.some(
      log => log.ip === ip               // log.ip 와 현재 ip가 같고
        && log.userAgent === userAgent          // log.userAgent와 userAgent가 같고
        && new Date(log.timestamp) > oneDayAgo  // 조회 시간이 24시간 이내인 경우
    );

    // 처음보거나, 24시간이 지난 경우 실행
    if (!hasRecentView) {
      post.views += 1;
      post.viewLogs.push({
        ip,
        userAgent,
        timestamp: new Date(),
      });
      await post.save();
    }

    let htmlContent;
    try {
      htmlContent = marked.parse(post.content || '');
    } catch (error) {
      console.log("마크다운 변환 실패: ", error);
      htmlContent = post.content;
    }

    const responseData = {
      ...post.toObject(),
      renderedContent: htmlContent,
    }

    res.json(responseData);
  } catch (error) {
    console.log("### 특정 게시글 조회 오류: ", error);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
});

/**
 * 게시글 생성
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, content, fileUrl } = req.body;

    const latestPost = await Post.findOne().sort({ number: -1});
    const nextNumber = latestPost ? latestPost.number + 1 : 1;

    const post = new Post({
      number: nextNumber,
      title,
      content,
      fileUrl,
    });

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.log("### 게시글 생성 오류: ", error);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
});

/**
 * 게시글 수정
 */
router.put("/:id", async (req, res) => {
  try {
    const { title, content, fileUrl } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    const imgRegex = /https:\/\/[^"']*?\.(?:png|jpg|jpeg|gif|PNG|JPG|JPEG|GIF)/g;
    const oldContentImages = post.content.match(imgRegex) || [];
    const newContentImages = content.match(imgRegex) || [];

    const deletedImages = oldContentImages.filter(url => !newContentImages.includes(url));
    const deletedFiles = (post.fileUrl || []).filter(url => !(fileUrl || []).includes(url));

    const getS3KeyFromUrl = (url) => {
      try {
        const urlObj = new URL(url);  // 파라미터로 받은 url은 url객체로 생성
        return decodeURIComponent(urlObj.pathname.substring(1));  // urlObj의 pathname에서 앞에 /를 제거하고 디코딩을 하여 원래의 문자열로 반환
      } catch (error) {
        console.log("### URL 파싱 에러: ", error);
        return null;
      }
    }

    const allDeletedFiles = [...deletedImages, ...deletedFiles];
    for(const fileUrl of allDeletedFiles) {
      const key = getS3KeyFromUrl(fileUrl);
      if (key) {
        try {
          await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
          }));

          console.log("파일 삭제 완료: ", key);
        } catch (error) {
          console.log("s3 파일 삭제 에러: ", error);
        }
      }
    }

    post.title = title;
    post.content = content;
    post.fileUrl = fileUrl;
    post.updatedAt = Date.now();

    await post.save();
    res.json(post);
  } catch (error) {
    console.log("### 게시글 수정 오류: ", error);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
});

/**
 * 게시글 삭제
 */
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    // content 내에 이미지 경로만 추출하기 위한 정규식 작성
    const imgRegex = /https:\/\/[^"']*?\.(?:png|jpg|jpeg|gif|PNG|JPG|JPEG|GIF)/g;
    const contentImages = post.content.match(imgRegex) || [];

    const getS3KeyFromUrl = (url) => {
      try {
        const urlObj = new URL(url);  // 파라미터로 받은 url은 url객체로 생성
        return decodeURIComponent(urlObj.pathname.substring(1));  // urlObj의 pathname에서 앞에 /를 제거하고 디코딩을 하여 원래의 문자열로 반환
      } catch (error) {
        console.log("### URL 파싱 에러: ", error);
        return null;
      }
    }

    const allFiles = [...contentImages, ...(post.fileUrl | [])];

    for(const fileUrl of allFiles) {
      const key = getS3KeyFromUrl(fileUrl);
      if (key) {
        console.log("삭제할 파일 키: ", key);

        try {
          await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
          }));
        } catch (error) {
          console.log("s3 파일 삭제 에러: ", error);
        }
      }
    }

    await post.deleteOne();
    res.json({ message: "게시글이 삭제 되었습니다." });
  } catch (error) {
    console.log("### 게시글 삭제 오류: ", error);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
});

module.exports = router;
