const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true, // 공백 제거
      minLength: 2,
      maxlength: 30,
    },
    password: {
      type: String,
      required: true,
      select: false,    // user 정보 조회 시 password는 검색되지 않도록 설정
    },
    // 동시 로그인 방지
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
    // 비밀번호 n회 이상 틀렸을 때 계정 잠김
    isActive: {
      type: Boolean,
      default: true,
    },
    // 비밀번호를 틀린 횟수
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    // 마지막으로 로그인을 시도한 날짜
    lastLoginAttempt: {
      type: Date
    },
    // 관리자 로그인 시 접속 네트워크의 IP 주소를 저장하는 필드
    ipAddress: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
  }, {
    timestamps: true,   // User 정보가 생성되거나 update될 때 자동으로 시간 데이터가 생성될 수 있도록 설정
  }
);

// 모델 이름은 'User'로 설정, User의 설정값은 userSchema로 설정
const User = mongoose.model("User", userSchema);

module.exports = User;