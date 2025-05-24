import { useQuery, useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import {
  getComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
  deleteComments,
} from '@/api/modules/comment';
import type {
  Comment,
  CommentQueryParams,
  CreateCommentParams,
  UpdateCommentParams,
} from '@/types/api/comment';

// 获取评论列表
export function useCommentsQuery(params: CommentQueryParams) {
  return useQuery({
    queryKey: ['comments', params],
    queryFn: () => getComments(params),
  });
}

// 获取单个评论
export function useCommentQuery(id: number) {
  return useQuery({
    queryKey: ['comment', id],
    queryFn: () => getComment(id),
    enabled: !!id,
  });
}

// 创建评论
export function useCreateCommentMutation(options?: UseMutationOptions<Comment, Error, CreateCommentParams>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createComment,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

// 更新评论
export function useUpdateCommentMutation(options?: UseMutationOptions<Comment, Error, { id: number; data: UpdateCommentParams }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateComment(id, data),
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

// 删除评论
export function useDeleteCommentMutation(options?: UseMutationOptions<null, Error, number>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteComment,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

// 批量删除评论
export function useDeleteCommentsMutation(options?: UseMutationOptions<{ deleted: number }, Error, number[]>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteComments,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      options?.onSuccess?.(data, variables, context);
    },
  });
} 