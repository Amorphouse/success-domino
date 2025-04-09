require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function(event, context) {
  // リクエストボディからデータを取得
  let role, goal, notes;
  try {
    const requestBody = JSON.parse(event.body);
    role = requestBody.role;
    goal = requestBody.goal;
    notes = requestBody.notes || '特になし';
    
    // 入力値の検証
    if (!role || !goal) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: '必須パラメータが不足しています。ロールと目的は必須です。' 
        })
      };
    }
  } catch (error) {
    console.error('リクエストボディの解析エラー:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        error: 'リクエストボディの解析に失敗しました。有効なJSONを送信してください。' 
      })
    };
  }

  // 改善されたプロンプト
  const prompt = `
# 指示
あなたは個人の成長と目標達成をサポートするAIアシスタントです。ユーザーの役割と目標に基づいて、今日1日で達成可能な具体的なチャレンジ（小さな目標）を作成してください。

# ユーザー情報
- ロール（職業/立場）: ${role}
- 長期的な目標: ${goal}
- 備考/制約条件: ${notes}

# チャレンジの条件
1. 今日1日で完了できる具体的なタスクであること
2. 長期目標への一歩となる意味のあるタスクであること
3. 明確で測定可能な成果があること
4. ユーザーのロールや状況に適していること
5. 実行するための具体的なステップを含むこと

# 出力形式
以下の構造でマークダウン形式で出力してください：

1. チャレンジのタイトル（見出し1）
2. チャレンジの概要と目的（簡潔な説明）
3. 期待される成果（箇条書き）
4. 実行ステップ（番号付きリスト）
5. 成功のためのヒント（箇条書き）
6. 振り返りの質問（箇条書き）

注意：出力は日本語で、具体的かつ実用的な内容にしてください。
`;

  try {
    // APIキーの検証
    if (!process.env.GOOGLE_API_KEY) {
      console.error('Google API Keyが設定されていません');
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'サーバー設定エラー: API Keyが設定されていません。' 
        })
      };
    }

    // Google AI APIの呼び出し
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });

    console.log(`チャレンジ生成開始: ロール=${role}, 目標=${goal}`);
    const result = await model.generateContent(prompt);
    const response = await result.response;

    // レスポンスの検証
    if (!response.candidates || response.candidates.length === 0) {
      console.error('AIからの応答が空です');
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'AIからの応答が空でした。もう一度お試しください。' 
        })
      };
    }

    const challenge = response.candidates[0].content.parts[0].text.trim();
    console.log('チャレンジ生成成功');
    
    // 成功レスポンスの返却
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({ 
        challenge,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    // エラーハンドリングの強化
    console.error('チャレンジ生成エラー:', error);
    
    let errorMessage = 'チャレンジの生成中にエラーが発生しました。';
    let statusCode = 500;
    
    if (error.message && error.message.includes('API key')) {
      errorMessage = 'API認証エラー: 有効なAPIキーが必要です。';
    } else if (error.message && error.message.includes('quota')) {
      errorMessage = 'APIクォータ超過: しばらく時間をおいてから再試行してください。';
    } else if (error.message && error.message.includes('timeout')) {
      errorMessage = 'タイムアウトエラー: サーバーの応答に時間がかかりすぎています。';
    }
    
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
