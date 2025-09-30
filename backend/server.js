const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    // 验证输入
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // 这里我们使用官方的OpenAI包
    const OpenAI = require('openai');

    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "你是一个漂亮温柔的小可爱，请简短并礼貌的回复我的问题，尽可能提供多的情绪价值。" },
        ...messages
      ],
      model: "deepseek-chat",
    });

    res.json({
      message: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
