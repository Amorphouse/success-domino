# SuccessDomino

## プロジェクト概要
SuccessDominoは、小さなチャレンジを提案するアプリケーションです。

## セットアップ方法
### GitHub
```bash
git config --local commit.template ./.gitcommit_template  
git config --global core.editor 'code --wait'
```
### フロントエンド
```bash
cd frontend
npm install
npm run serve
```

### バックエンド
```bash
cd backend
npm install
echo "OPENAI_API_KEY=your_openai_api_key" > .env
npm start
```