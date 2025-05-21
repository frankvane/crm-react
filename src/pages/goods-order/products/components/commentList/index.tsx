import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getComments } from '@/api/modules/comment';
import { CommentListResponse, Comment } from '@/types/api/comment';
import { FixedSizeList as List } from 'react-window';
import { Spin } from 'antd';
import dayjs from 'dayjs';

const PAGE_SIZE = 30;

interface CommentListProps {
  productId?: number | string;
}

const CommentList: React.FC<CommentListProps> = ({ productId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);

  // 加载评论
  const loadComments = useCallback(async (nextPage: number, reset = false) => {
    if (loadingRef.current || !hasMore) return;
    setLoading(true);
    loadingRef.current = true;
    try {
      const params: any = { page: nextPage, pageSize: PAGE_SIZE };
      if (productId) params.product_id = productId;
      const res: CommentListResponse = await getComments(params);
      setComments(prev => {
        const newList = reset ? res.list : [...prev, ...res.list];
        setHasMore(newList.length < res.pagination.total);
        return newList;
      });
      setPage(nextPage);
    } catch (err) {
      console.error('获取评论失败', err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [hasMore, productId]);

  // 首次加载或productId变化时重置
  useEffect(() => {
    setComments([]);
    setPage(1);
    setHasMore(true);
    loadComments(1, true);
    // eslint-disable-next-line
  }, [productId]);

  // 虚拟列表每行渲染
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const comment = comments[index];
    if (!comment) {
      return (
        <div style={{ ...style, textAlign: 'center', color: '#888' }}>
          {hasMore ? '加载中...' : '没有更多评论了'}
        </div>
      );
    }
    return (
      <div
        style={{
          ...style,
          background: index % 2 === 0 ? '#fafbfc' : '#fff',
          padding: '14px 12px 10px 12px',
          borderBottom: '1px solid #f0f0f0',
          borderRadius: 6,
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontWeight: 600, color: '#1677ff', marginRight: 12 }}>用户ID: {comment.user_id}</span>
          <span style={{ marginLeft: 'auto', color: '#bbb', fontSize: 12 }}>{dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm:ss')}</span>
        </div>
        <div style={{ fontSize: 15, color: '#222', margin: '6px 0 8px 0', lineHeight: 1.7 }}>{comment.content}</div>
        <div style={{ fontSize: 13, color: '#faad14', fontWeight: 500 }}>评分: {comment.rating ?? '-'} 星</div>
      </div>
    );
  };

  // 监听滚动，触底加载
  const handleItemsRendered = useCallback(({ visibleStopIndex }: { visibleStopIndex: number }) => {
    if (visibleStopIndex >= comments.length - 1 && hasMore && !loading) {
      loadComments(page + 1);
    }
  }, [comments.length, hasMore, loading, loadComments, page]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <List
        height={600}
        itemCount={hasMore ? comments.length + 1 : comments.length}
        itemSize={90}
        width={'100%'}
        onItemsRendered={({ visibleStopIndex }) => handleItemsRendered({ visibleStopIndex })}
      >
        {Row}
      </List>
      {loading && <Spin style={{ position: 'absolute', left: '50%', top: 20, transform: 'translateX(-50%)' }} />}
    </div>
  );
};

export default CommentList;
