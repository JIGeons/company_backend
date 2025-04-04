import mongoose, { Model, Schema } from "mongoose";

// Interface
import { Post } from '@interfaces/post.interface';

const postSchema: Schema<Post> = new Schema(
  {
    number: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: [String],
      trim: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    viewLogs: [{ // 동일한 유저가 반복 조회 시 views가 계속 증가하는 것을 방지하기 위한 필드
      ip: String,
      userAgent: String,
      timestamp: {
        type: Date,
        default: Date.now,
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true,
  }
);

const Post: Model<Post> = mongoose.model<Post>("Post", postSchema);

export default Post;