import type {
	Comment,
	CommentListResponse,
	CommentQueryParams,
	CreateCommentParams,
	UpdateCommentParams,
} from "@/types/api/comment";

import request from "@/utils/request";

// 获取评论列表
export const getComments = async (
	params: CommentQueryParams,
): Promise<CommentListResponse> => {
	return request.get("/comment", { params });
};

// 获取单个评论
export const getComment = async (id: number): Promise<Comment> => {
	return request.get(`/comment/${id}`);
};

// 创建评论
export const createComment = async (
	data: CreateCommentParams,
): Promise<Comment> => {
	return request.post("/comment", data);
};

// 更新评论
export const updateComment = async (
	id: number,
	data: UpdateCommentParams,
): Promise<Comment> => {
	return request.put(`/comment/${id}`, data);
};

// 删除评论
export const deleteComment = async (id: number): Promise<null> => {
	return request.delete(`/comment/${id}`);
};

// 批量删除评论
export const deleteComments = async (
	ids: number[],
): Promise<{ deleted: number }> => {
	return request.delete("/comment", { data: { ids } });
};
