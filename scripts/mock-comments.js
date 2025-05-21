import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6W3siaWQiOjEwLCJuYW1lIjoi566h55CG5ZGYIiwicGVybWlzc2lvbnMiOlsicGVybWlzc2lvbjp1c2VyczphZGQiLCJwZXJtaXNzaW9uOnVzZXJzOmVkaXQiLCJwZXJtaXNzaW9uOnVzZXJzOmRlbGV0ZSIsInBlcm1pc3Npb246dXNlcnM6ZXhwb3J0IiwicGVybWlzc2lvbjp1c2Vyczphc3NpZ24iLCJwZXJtaXNzaW9uOnJvbGVzOmFkZCIsInBlcm1pc3Npb246cm9sZXM6ZWRpdCIsInBlcm1pc3Npb246cm9sZXM6ZGVsZXRlIiwicGVybWlzc2lvbjpyb2xlczphc3NpZ24iLCJwZXJtaXNzaW9uOnJlc291cmNlczphZGQiLCJwZXJtaXNzaW9uOnJlc291cmNlczplZGl0IiwicGVybWlzc2lvbjpyZXNvdXJjZXM6ZGVsZXRlIiwiY2F0ZWdvcnk6Y2F0ZWdvcnktdHlwZXM6YWRkIiwiY2F0ZWdvcnk6Y2F0ZWdvcnktdHlwZXM6ZWRpdCIsImNhdGVnb3J5OmNhdGVnb3J5LXR5cGVzOmRlbGV0ZSIsImNhdGVnb3J5OmNhdGVnb3J5LXR5cGVzOnZpZXciLCJjYXRlZ29yeTpjYXRlZ29yaWVzOmFkZCIsImNhdGVnb3J5OmNhdGVnb3JpZXM6ZWRpdCIsImNhdGVnb3J5OmNhdGVnb3JpZXM6ZGVsZXRlIiwiY2F0ZWdvcnk6Y2F0ZWdvcmllczp2aWV3IiwiZ29vZHMtb3JkZXI6YWxidW1zOmFkZCIsImdvb2RzLW9yZGVyOmFsYnVtczplZGl0IiwiZ29vZHMtb3JkZXI6YWxidW1zOmRlbGV0ZSIsImdvb2RzLW9yZGVyOmFsYnVtczp2aWV3IiwiZ29vZHMtb3JkZXI6YWxidW1zOmV4cG9ydCIsImdvb2RzLW9yZGVyOnByb2R1Y3RzOmFkZCIsImdvb2RzLW9yZGVyOnByb2R1Y3RzOmVkaXQiLCJnb29kcy1vcmRlcjpwcm9kdWN0czpkZWxldGUiLCJnb29kcy1vcmRlcjpwcm9kdWN0czp2aWV3IiwiZ29vZHMtb3JkZXI6cHJvZHVjdHM6ZXhwb3J0IiwiZ29vZHMtb3JkZXI6b3JkZXJzOmFkZCIsImdvb2RzLW9yZGVyOm9yZGVyczplZGl0IiwiZ29vZHMtb3JkZXI6b3JkZXJzOmRlbGV0ZSIsImdvb2RzLW9yZGVyOm9yZGVyczp2aWV3IiwiZ29vZHMtb3JkZXI6b3JkZXJzOmV4cG9ydCIsImdvb2RzLW9yZGVyOmxvZ2lzdGljczphZGQiLCJnb29kcy1vcmRlcjpsb2dpc3RpY3M6ZWRpdCIsImdvb2RzLW9yZGVyOmxvZ2lzdGljczpkZWxldGUiLCJnb29kcy1vcmRlcjpsb2dpc3RpY3M6dmlldyIsImdvb2RzLW9yZGVyOmxvZ2lzdGljczpleHBvcnQiXX1dLCJpYXQiOjE3NDcyOTQzMzgsImV4cCI6MTc0NzM4MDczOH0.Q3w96v7psA0qKjYLgsoJtQR7Y2lwh4qqZzvkjFMDaMw',
    'Content-Type': 'application/json'
  }
});

// 创建评论的函数
const createComment = async (data) => {
  const response = await api.post('/comment', data);
  return response.data;
};

// 随机生成评论内容
const commentContents = [
  '非常好用，效果不错！',
  '物流很快，包装严实。',
  '性价比高，值得购买。',
  '使用后感觉一般。',
  '产品质量有待提高。',
  '客服态度很好，满意。',
  '还会回购。',
  '推荐给朋友了。',
  '包装有点破损。',
  '效果明显，五星好评！',
  '价格实惠，物超所值。',
  '体验感不错，值得推荐。',
  '收到货有点小瑕疵。',
  '售后服务很到位。',
  '发货速度一般。',
  '描述与实物一致。',
  '有点小贵，但质量不错。',
  '使用后出现了一些问题。',
  '整体满意，下次还会购买。',
  '不太满意，和预期有差距。',
  '包装精美，送人很合适。',
  '客服回复及时，点赞。',
  '快递慢了一点。',
  '产品设计很人性化。',
  '有点味道，晾一晾就好了。',
  '赠品很实用，感谢商家。',
  '第一次购买，体验不错。',
  '希望耐用性更好。',
  '细节处理还需加强。',
  '朋友推荐来的，没失望。',
  '收到时有点脏，擦擦能用。',
  '功能齐全，满足需求。',
  '售后处理速度快。',
  '外观漂亮，手感不错。',
  '有点小问题，客服已解决。',
  '希望以后多做活动。',
  '实际效果比图片好。',
  '不如预期，凑合用吧。',
  '下单后很快就发货了。',
  '建议增加更多颜色选择。',
  '总体来说还不错，值得一试。'
];

// 生成随机评论
function generateMockComment(index, productIds, userIds) {
  const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const getRandomRating = () => Math.floor(Math.random() * 5) + 1; // 1-5星
  return {
    product_id: getRandomItem(productIds),
    user_id: getRandomItem(userIds),
    content: getRandomItem(commentContents),
    rating: getRandomRating(),
    parent_id: null,
    status: 1
  };
}

// 批量创建评论（支持最大并发数为10）
async function batchCreateComments(count, productIds, userIds) {
  const concurrency = 10;
  let index = 0;
  let finished = 0;
  console.log(`开始创建${count}条评论...`);

  // 创建一个处理单条评论的异步函数
  const handleOne = async (i) => {
    const commentData = generateMockComment(i, productIds, userIds);
    try {
      const result = await createComment(commentData);
      console.log(`成功创建第${i + 1}条评论:`, result.data.content);
    } catch (error) {
      console.error(`创建第${i + 1}条评论失败:`, error?.response?.data?.message || error.message);
    }
    finished++;
  };

  // 并发池
  const pool = [];
  while (index < count) {
    if (pool.length < concurrency) {
      const p = handleOne(index++).then(() => {
        // 从池中移除已完成的Promise
        pool.splice(pool.indexOf(p), 1);
      });
      pool.push(p);
    } else {
      // 等待任意一个Promise完成
      await Promise.race(pool);
    }
  }
  // 等待所有剩余的Promise完成
  await Promise.all(pool);
  console.log('批量创建评论完成！');
}

// 示例：为产品ID 1-1051，用户ID 1-5，每个产品生成20条评论
const productIds = Array.from({ length: 1051 }, (_, i) => i + 1); // [1,2,...,1051]
const userIds = [10, 11, 12];
batchCreateComments(100000, productIds, userIds);
