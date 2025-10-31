/* server.js  ––  Vercel Serverless 兼容版  */
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

/* ---------- 中间件 ---------- */
// 更完善的 CORS 配置
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

/* ---------- 聊天接口 ---------- */
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    const OpenAI = require('openai');
    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: '你是一个漂亮温柔的小可爱，请简短并礼貌的回复我的问题，尽可能提供多的情绪价值。' },
        ...messages,
      ],
      model: 'deepseek-chat',
    });

    return res.json({ message: completion.choices[0].message.content });
  } catch (err) {
    console.error('/api/chat error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/* ---------- 文本总结接口 ---------- */
app.post('/api/summary', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const OpenAI = require('openai');
    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: '你是一位专业的法律知识专家，请基于用户提供的法律文档内容提供准确、简洁的总结。请提取关键的法律要点，并以结构化的方式呈现。'
        },
        { role: 'user', content: content }
      ],
      model: 'deepseek-chat',
    });

    return res.json({ summary: completion.choices[0].message.content });
  } catch (err) {
    console.error('/api/summary error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 在非 Vercel 环境中启动服务器
if (require.main === module) {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  // 优雅关闭
  process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    server.close(() => {
      console.log('Process terminated.');
    });
  });
}

/* ---------- 导出给 Vercel ---------- */
module.exports = app;
