export interface Comment {
	id: number | string;
	product_id: number | string;
	user_id: number | string;
	content: string;
	rating?: number;
	parent_id?: number | string;
	status: number;
	createdAt: string;
	updatedAt: string;
}

export interface CommentQueryParams {
	page?: number;
	pageSize?: number;
	search?: string;
	content?: string;
	product_id?: number | string;
	user_id?: number | string;
	status?: number;
}

export type CreateCommentParams = Omit<
	Comment,
	"id" | "createdAt" | "updatedAt"
>;
export type UpdateCommentParams = Partial<CreateCommentParams>;

export interface CommentListResponse {
	list: Comment[];
	pagination: {
		current: number;
		pageSize: number;
		total: number;
	};
}
