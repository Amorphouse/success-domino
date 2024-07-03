require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function(event, context) {
  const { role, goal, notes } = JSON.parse(event.body);
  const prompt = `ユーザーのロールは${role}で、目的は${goal}。備考として${notes}が記載されています。これに基づいて小さなチャレンジをmarkdown形式で生成してください。`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

    const result = await model.generateContent(prompt);
    const response = await result.response;

    const challenge = response.candidates[0].content.parts[0].text.trim();
    return {
      statusCode: 200,
      body: JSON.stringify({ challenge })
    };
  } catch (error) {
    console.error('Error generating challenge:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'チャレンジ生成中にエラーが発生しました。' })
    };
  }
};
