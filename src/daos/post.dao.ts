/**
 * Post Dao
 */
import { Service } from "typedi";
import Post from "@/database/mongo/models/post.model";

// Dto
import { CreatePostDto, UpdatePostDto } from "@/dtos/post.dto";
import {Result} from "@interfaces/result.interface";

@Service()
export class PostDao {
  async findAll(): Promise<Result> {
    try {
      // createdAt을 기준으로 내림차순 조회
      const postsResult = await Post.find().sort({ createdAt: -1 }).lean();
      if (!postsResult || postsResult.length === 0) {
        return { success: false, data: [] }
      }

      return { success: true, data: postsResult };
    } catch (error) {
      return { success: false, error: "전체 Post 조회 중 문제 발생" };
    }
  }

  async findOneById(id: string): Promise<Result> {
    try {
      const postResult = await Post.findById(id).lean();
      if (!postResult) {
        return { success: false, data: [] }
      }

      return { success: true, data: postResult };
    } catch (error) {
      return { success: false, error: "Id로 Post 조회 중 문제 발생" };
    }
  }

  async findOneByIdCanSave(id: string): Promise<Result> {
    try {
      const postResult = await Post.findById(id);
      if (!postResult) {
        return { success: false, data: [] }
      }

      return { success: true, data: postResult };
    } catch (error) {
      return { success: false, error: "Id로 Post 조회 중 문제 발생" };
    }
  }

  async findOneByRecentNumber(): Promise<Result> {
    try {
      const postResult = await Post.findOne().sort({ number: -1 }).lean();

      if (!postResult) {
        return { success: false, data: null }
      }

      return { success: false, data: postResult };
    } catch (error) {
      return { success: false, error: "Recent Post 조회 중 문제 발생" };
    }
  }

  async createPost(createPostDto: CreatePostDto): Promise<Result> {
    try {
      const createPostResult = await Post.create(createPostDto);
      if (!createPostResult) {
        return { success: false, data: [] }
      }

      return { success: true, data: createPostResult.toObject() };
    } catch (error) {
      return { success: false, error: "Create Post 중 문제 발생"};
    }
  }

  async updatePost(updatePostDto: UpdatePostDto): Promise<Result> {
    try {
      const updatePostResult = await Post.findByIdAndUpdate(updatePostDto.id, updatePostDto, { new: true }).lean();
      if (!updatePostResult) {
        return { success: false, data: [] }
      }

      return { success: true, data: updatePostResult };
    } catch (error) {
      return { success: false, error: "Update Post 중 문제 발생" };
    }
  }

  async deletePost(id: string): Promise<Result> {
    try {
      const deletePostResult = await Post.findByIdAndDelete(id);
      if (!deletePostResult) {
        return { success: false, data: [] }
      }

      return { success: true, data: deletePostResult };
    } catch (error) {
      return { success: false, error: "Delete Post 중 문제 발생" };
    }
  }
}