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

## test
ローカル環境でVueアプリケーションをテストするためには、以下の手順に従ってください。

### 1. Vue開発サーバーの起動

1. フロントエンドプロジェクトディレクトリに移動します。

```bash
cd frontend
```

2. 必要な依存関係をインストールします。

```bash
npm install
```

3. 開発サーバーを起動します。

```bash
npm run serve
```

これで、開発サーバーが起動し、通常は`http://localhost:8080`でアプリケーションにアクセスできます。

### 2. Netlify Functionsのローカルテスト

Netlify CLIを使用して、Netlify Functionsをローカルでテストできます。

1. プロジェクトのルートディレクトリに戻ります。

```bash
cd ..
```

2. Netlify CLIをインストールします。

```bash
npm install -g netlify-cli
```

3. Netlify Devサーバーを起動します。

```bash
netlify dev
```

Netlify Devサーバーは、フロントエンドアプリケーションとバックエンドのNetlify Functionsをローカルで提供します。通常、`http://localhost:8888`でアプリケーションにアクセスでき、バックエンドAPIも同時にテストできます。

### 3. 環境変数の設定

`netlify dev`を使用する際には、環境変数を設定する必要があります。Netlifyでは`netlify.toml`ファイルに設定できます。

`netlify.toml`の例:

```toml
[build]
  functions = "backend/functions"

[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"

[dev]
  command = "npm run serve"
  port = 8888
  targetPort = 8080

[context.production.environment]
  OPENAI_API_KEY = "your_openai_api_key"
```

ローカル環境では、`.env`ファイルに設定できます。

`.env`の例:

```env
OPENAI_API_KEY=your_openai_api_key
```

### 4. VueアプリケーションでAPIリクエストを行う部分の設定

VueアプリケーションのAPIリクエスト部分は、Netlify Devサーバーが起動しているときに、ローカルのNetlify Functionsを呼び出すようにします。

`frontend/src/components/ChallengeForm.vue`を次のように更新します。

```vue
<script>
import axios from 'axios';

export default {
  data() {
    return {
      role: '',
      goal: '',
      notes: '',
      challenge: ''
    };
  },
  methods: {
    async handleSubmit() {
      try {
        const response = await axios.post('/.netlify/functions/generate-challenge', {
          role: this.role,
          goal: this.goal,
          notes: this.notes
        });
        this.challenge = response.data.challenge;
      } catch (error) {
        console.error('Error generating challenge:', error);
      }
    }
  }
};
</script>
```

### テスト

以上の手順で、ローカル環境でアプリケーションの動作を確認できます。開発サーバーを起動し、ブラウザで`http://localhost:8888`にアクセスして、アプリケーションが正しく動作するかをテストしてください。

### コマンドまとめ

1. フロントエンド依存関係のインストールと開発サーバーの起動:

```bash
cd frontend
npm install
npm run serve
```

2. プロジェクトのルートディレクトリに戻り、Netlify CLIのインストールとNetlify Devサーバーの起動:

```bash
cd ..
npm install -g netlify-cli
netlify dev
```

3. ブラウザで`http://localhost:8888`にアクセスして動作確認。

これでローカルでVueの表示とAPIのテストができます。