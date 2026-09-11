const DISCORD_GATEWAY =
"wss://gateway.discord.gg/?v=10&encoding=json";

const DISCORD_API =
"https://discord.com/api/v10";

const GEMINI_MODEL =
"gemini-3.5-flash-lite";

const INTENTS =
(1 << 0) |
(1 << 9) |
(1 << 15);

// ============================================================
// Worker
// ============================================================

export default {
async fetch(request, env) {
const url = new URL(request.url);

```
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};


// ========================================================
// CORS
// ========================================================

if (request.method === "OPTIONS") {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}


// ========================================================
// API 서버 메인 페이지
// ========================================================

if (
  request.method === "GET" &&
  url.pathname === "/"
) {
  return new Response(
    CHAT_HISTORY_HTML,
    {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type":
          "text/html; charset=UTF-8"
      }
    }
  );
}


// ========================================================
// 대화 기록
// ========================================================

if (
  request.method === "GET" &&
  url.pathname === "/api/history"
) {
  try {
    const id =
      env.DISCORD_BOT.idFromName("main");

    const stub =
      env.DISCORD_BOT.get(id);

    return await stub.fetch(
      "https://discord-bot/history"
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json; charset=UTF-8"
        }
      }
    );
  }
}


// ========================================================
// 대리구매 신청
// ========================================================

if (
  request.method === "POST" &&
  url.pathname === "/api/apply"
) {
  try {
    if (!env.APPLY) {
      console.error(
        "APPLY Secret이 설정되지 않았습니다."
      );

      return new Response(
        "대리구매 신청 웹후크가 설정되지 않았습니다.",
        {
          status: 500,
          headers: corsHeaders
        }
      );
    }


    const data =
      await request.json();


    if (
      !data.name ||
      !data.phone ||
      !data.address ||
      !data.product ||
      !data.code
    ) {
      return new Response(
        "모든 항목을 입력해주세요.",
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }


    const message = {
      content:
        "**대리구매 신청**\n\n" +
        "**이름**\n" +
        data.name +
        "\n\n" +
        "**연락받을 전화번호**\n" +
        data.phone +
        "\n\n" +
        "**주소**\n" +
        data.address +
        "\n\n" +
        "**상품 링크**\n" +
        data.product +
        "\n\n" +
        "**기프트카드 코드**\n" +
        data.code
    };


    const discordResponse =
      await fetch(
        env.APPLY,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(message)
        }
      );


    if (!discordResponse.ok) {
      const discordText =
        await discordResponse.text();

      console.error(
        "APPLY Discord 오류:",
        discordResponse.status,
        discordText
      );

      return new Response(
        "Discord 전송에 실패했습니다.",
        {
          status: 500,
          headers: corsHeaders
        }
      );
    }


    return new Response(
      "신청이 정상적으로 접수되었습니다.",
      {
        status: 200,

        headers: {
          ...corsHeaders,
          "Content-Type":
            "text/plain; charset=UTF-8"
        }
      }
    );

  } catch (error) {

    console.error(
      "대리구매 신청 오류:",
      error
    );

    return new Response(
      "서버 오류가 발생했습니다.",
      {
        status: 500,
        headers: corsHeaders
      }
    );
  }
}


// ========================================================
// 문의
// ========================================================

if (
  request.method === "POST" &&
  url.pathname === "/api/inquiry"
) {
  try {

    if (!env.INQUIRY) {
      console.error(
        "INQUIRY Secret이 설정되지 않았습니다."
      );

      return new Response(
        "문의 웹후크가 설정되지 않았습니다.",
        {
          status: 500,
          headers: corsHeaders
        }
      );
    }


    const data =
      await request.json();


    if (!data.inquiry) {
      return new Response(
        "문의 내용을 입력해주세요.",
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }


    const message = {
      content:
        "**문의**\n\n" +
        data.inquiry
    };


    const discordResponse =
      await fetch(
        env.INQUIRY,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(message)
        }
      );


    if (!discordResponse.ok) {

      const discordText =
        await discordResponse.text();

      console.error(
        "INQUIRY Discord 오류:",
        discordResponse.status,
        discordText
      );

      return new Response(
        "Discord 전송에 실패했습니다.",
        {
          status: 500,
          headers: corsHeaders
        }
      );
    }


    return new Response(
      "문의가 정상적으로 접수되었습니다.",
      {
        status: 200,

        headers: {
          ...corsHeaders,
          "Content-Type":
            "text/plain; charset=UTF-8"
        }
      }
    );

  } catch (error) {

    console.error(
      "문의 처리 오류:",
      error
    );

    return new Response(
      "서버 오류가 발생했습니다.",
      {
        status: 500,
        headers: corsHeaders
      }
    );
  }
}


// ========================================================
// Discord Gateway 시작
// ========================================================

if (url.pathname === "/start") {

  try {

    const id =
      env.DISCORD_BOT.idFromName("main");

    const stub =
      env.DISCORD_BOT.get(id);

    const response =
      await stub.fetch(
        "https://discord-bot/start"
      );

    return response;

  } catch (error) {

    return new Response(
      "Start error: " +
      error.message,
      {
        status: 500,
        headers: corsHeaders
      }
    );
  }
}


// ========================================================
// 상태 확인
// ========================================================

if (url.pathname === "/status") {

  try {

    const id =
      env.DISCORD_BOT.idFromName("main");

    const stub =
      env.DISCORD_BOT.get(id);

    return await stub.fetch(
      "https://discord-bot/status"
    );

  } catch (error) {

    return new Response(
      "Status error: " +
      error.message,
      {
        status: 500,
        headers: corsHeaders
      }
    );
  }
}


return new Response(
  "Not Found",
  {
    status: 404,
    headers: corsHeaders
  }
);
```

},

// ========================================================
// 매분 실행
// ========================================================

async scheduled(event, env, ctx) {

```
const id =
  env.DISCORD_BOT.idFromName("main");

const stub =
  env.DISCORD_BOT.get(id);

ctx.waitUntil(
  stub.fetch(
    "https://discord-bot/start"
  )
);
```

}
};

// ============================================================
// Discord Bot Durable Object
// ============================================================

export class DiscordBot {

constructor(state, env) {

```
this.state = state;
this.env = env;

this.socket = null;

this.connected = false;
this.identified = false;

this.heartbeatTimer = null;
this.reconnectTimer = null;
```

}

async fetch(request) {

```
const url =
  new URL(request.url);


// ========================================================
// 시작
// ========================================================

if (url.pathname === "/start") {

  await this.connect();

  return new Response(
    this.connected
      ? "Discord Gateway connected."
      : "Discord Gateway connection started."
  );
}


// ========================================================
// 상태
// ========================================================

if (url.pathname === "/status") {

  return new Response(
    JSON.stringify({
      connected:
        this.connected,

      identified:
        this.identified
    }),
    {
      headers: {
        "Content-Type":
          "application/json"
      }
    }
  );
}


// ========================================================
// 기록
// ========================================================

if (url.pathname === "/history") {

  const history =
    await this.getHistory();

  return new Response(
    JSON.stringify(history),
    {
      status: 200,

      headers: {
        "Content-Type":
          "application/json; charset=UTF-8"
      }
    }
  );
}


return new Response(
  "Not Found",
  {
    status: 404
  }
);
```

}

// ==========================================================
// Discord Gateway 연결
// ==========================================================

async connect() {

```
if (this.socket) {

  if (
    this.socket.readyState ===
      WebSocket.OPEN ||
    this.socket.readyState ===
      WebSocket.CONNECTING
  ) {
    return;
  }
}


const token =
  this.env.AI_coupang_discord;


if (!token) {

  console.error(
    "AI_coupang_discord 환경변수가 없습니다."
  );

  return;
}


console.log(
  "Discord Gateway 연결 시작"
);


try {

  const socket =
    new WebSocket(
      DISCORD_GATEWAY
    );


  this.socket =
    socket;

  this.connected =
    false;

  this.identified =
    false;


  socket.addEventListener(
    "open",
    () => {

      console.log(
        "Discord Gateway WebSocket OPEN"
      );

      this.connected =
        true;
    }
  );


  socket.addEventListener(
    "message",
    event => {

      this.handleGatewayMessage(
        event.data
      );
    }
  );


  socket.addEventListener(
    "close",
    event => {

      console.log(
        "Discord Gateway CLOSED: " +
        event.code +
        " " +
        (event.reason || "")
      );

      this.connected =
        false;

      this.identified =
        false;

      this.clearHeartbeat();

      this.socket =
        null;

      this.scheduleReconnect();
    }
  );


  socket.addEventListener(
    "error",
    error => {

      console.error(
        "Discord Gateway ERROR:",
        error
      );
    }
  );


  // 9분마다 재연결

  setTimeout(
    () => {

      if (
        this.socket === socket &&
        socket.readyState ===
          WebSocket.OPEN
      ) {

        console.log(
          "9분 경과 - Discord Gateway 재연결"
        );

        try {

          socket.close(
            1000,
            "Scheduled reconnect"
          );

        } catch {}
      }

    },
    9 * 60 * 1000
  );


} catch (error) {

  console.error(
    "Discord Gateway 연결 실패:",
    error
  );

  this.connected =
    false;

  this.socket =
    null;

  this.scheduleReconnect();
}
```

}

// ==========================================================
// 재연결
// ==========================================================

scheduleReconnect() {

```
if (this.reconnectTimer) {
  return;
}


this.reconnectTimer =
  setTimeout(
    async () => {

      this.reconnectTimer =
        null;

      await this.connect();

    },
    5000
  );
```

}

// ==========================================================
// Gateway 이벤트 처리
// ==========================================================

handleGatewayMessage(rawData) {

```
let payload;


try {

  payload =
    typeof rawData === "string"
      ? JSON.parse(rawData)
      : JSON.parse(
          new TextDecoder()
            .decode(rawData)
        );

} catch (error) {

  console.error(
    "Gateway JSON 파싱 실패:",
    error
  );

  return;
}


const {
  op,
  d,
  t
} = payload;


console.log(
  "Discord Gateway 이벤트: op=" +
  op +
  ", t=" +
  (t || "NONE")
);


// ========================================================
// Hello
// ========================================================

if (op === 10) {

  const heartbeatInterval =
    d?.heartbeat_interval ||
    41250;


  this.startHeartbeat(
    heartbeatInterval
  );


  this.identify();

  return;
}


// ========================================================
// Heartbeat ACK
// ========================================================

if (op === 11) {

  console.log(
    "Discord Heartbeat ACK"
  );

  return;
}


// ========================================================
// Reconnect
// ========================================================

if (op === 7) {

  console.log(
    "Discord가 재연결을 요청했습니다."
  );

  this.closeAndReconnect();

  return;
}


// ========================================================
// Invalid Session
// ========================================================

if (op === 9) {

  console.log(
    "Discord Invalid Session"
  );

  setTimeout(
    () => {
      this.identify();
    },
    3000
  );

  return;
}


// ========================================================
// Dispatch
// ========================================================

if (op === 0) {

  if (t === "READY") {

    console.log(
      "================================"
    );

    console.log(
      "Discord 봇 로그인 성공"
    );

    console.log(
      "봇 사용자: " +
      (
        d?.user?.username ||
        "Unknown"
      )
    );

    console.log(
      "================================"
    );

    this.identified =
      true;

    return;
  }


  if (
    t === "MESSAGE_CREATE"
  ) {

    this.handleMessageCreate(
      d
    );

    return;
  }
}
```

}

// ==========================================================
// Heartbeat
// ==========================================================

startHeartbeat(interval) {

```
this.clearHeartbeat();

this.sendHeartbeat();


this.heartbeatTimer =
  setInterval(
    () => {

      this.sendHeartbeat();

    },
    interval
  );
```

}

clearHeartbeat() {

```
if (
  this.heartbeatTimer
) {

  clearInterval(
    this.heartbeatTimer
  );

  this.heartbeatTimer =
    null;
}
```

}

sendHeartbeat() {

```
if (
  !this.socket ||
  this.socket.readyState !==
    WebSocket.OPEN
) {
  return;
}


try {

  this.socket.send(
    JSON.stringify({
      op: 1,
      d: null
    })
  );


  console.log(
    "Discord Heartbeat 전송"
  );

} catch (error) {

  console.error(
    "Heartbeat 전송 실패:",
    error
  );
}
```

}

// ==========================================================
// Identify
// ==========================================================

identify() {

```
if (
  !this.socket ||
  this.socket.readyState !==
    WebSocket.OPEN
) {
  return;
}


const token =
  this.env.AI_coupang_discord;


if (!token) {

  console.error(
    "AI_coupang_discord 환경변수가 없습니다."
  );

  return;
}


try {

  this.socket.send(
    JSON.stringify({
      op: 2,

      d: {
        token,

        intents:
          INTENTS,

        properties: {
          os: "linux",

          browser:
            "cloudflare-worker",

          device:
            "cloudflare-worker"
        }
      }
    })
  );


  console.log(
    "Discord Identify 전송"
  );

} catch (error) {

  console.error(
    "Identify 전송 실패:",
    error
  );
}
```

}

// ==========================================================
// 재연결
// ==========================================================

closeAndReconnect() {

```
this.clearHeartbeat();


if (this.socket) {

  try {

    this.socket.close(
      1000,
      "Discord requested reconnect"
    );

  } catch {}
}


this.socket =
  null;

this.connected =
  false;

this.identified =
  false;


this.scheduleReconnect();
```

}

// ==========================================================
// Discord 메시지
// ==========================================================

async handleMessageCreate(message) {

```
if (!message) {
  return;
}


// 봇 메시지 무시

if (
  message.author?.bot
) {
  return;
}


// ========================================================
// 허용된 채널
// ========================================================

const devChannel =
  this.env.AI_coupang_discord_dev_channel;

const userChannel =
  this.env.AI_coupang_discord_user_channel;


const channelId =
  String(message.channel_id);


if (
  channelId !==
    String(devChannel) &&
  channelId !==
    String(userChannel)
) {

  console.log(
    "허용되지 않은 채널 메시지 무시: " +
    channelId
  );

  return;
}


const content =
  message.content?.trim();


if (!content) {
  return;
}


console.log(
  "Discord 메시지 수신: " +
  content
);


// ========================================================
// 사용자 메시지 저장
// ========================================================

await this.saveMessage({

  type: "user",

  channelId:

    channelId,

  username:

    message.author?.global_name ||
    message.author?.username ||
    "사용자",

  content:

    content,

  timestamp:

    Date.now()
});


// ========================================================
// Gemini
// ========================================================

try {

  const answer =
    await this.askGemini(
      content
    );


  if (!answer) {

    console.error(
      "Gemini 응답이 비어 있습니다."
    );

    return;
  }


  // ======================================================
  // Discord 답변
  // ======================================================

  await this.sendDiscordMessage(
    channelId,
    answer
  );


  // ======================================================
  // AI 답변 저장
  // ======================================================

  await this.saveMessage({

    type: "ai",

    channelId:

      channelId,

    username:

      "AI",

    content:

      answer,

    timestamp:

      Date.now()
  });


} catch (error) {

  console.error(
    "AI 처리 실패:",
    error
  );


  try {

    const errorMessage =
      "AI 처리 중 오류가 발생했습니다.\n" +
      "`" +
      error.message +
      "`";


    await this.sendDiscordMessage(
      channelId,
      errorMessage
    );


    await this.saveMessage({

      type: "ai",

      channelId:

        channelId,

      username:

        "AI",

      content:

        errorMessage,

      timestamp:

        Date.now()
    });


  } catch (sendError) {

    console.error(
      "오류 메시지 전송 실패:",
      sendError
    );
  }
}
```

}

// ==========================================================
// Gemini
// ==========================================================

async askGemini(userMessage) {

```
const apiKey =
  this.env.AI_coupang_api;


if (!apiKey) {

  throw new Error(
    "AI_coupang_api 환경변수가 없습니다."
  );
}


const endpoint =
  "https://generativelanguage.googleapis.com/v1beta/models/" +
  GEMINI_MODEL +
  ":generateContent";


console.log(
  "Gemini API 요청 시작"
);


const response =
  await fetch(
    endpoint,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        "x-goog-api-key":
          apiKey
      },

      body:
        JSON.stringify({

          contents: [
            {
              role: "user",

              parts: [
                {
                  text:
                    userMessage
                }
              ]
            }
          ],

          generationConfig: {

            temperature:
              0.7,

            topP:
              0.9,

            maxOutputTokens:
              2048
          }
        })
    }
  );


const text =
  await response.text();


if (!response.ok) {

  console.error(
    "Gemini API 오류 " +
    response.status +
    ":",
    text
  );


  throw new Error(
    "Gemini API " +
    response.status +
    ": " +
    text
  );
}


let data;


try {

  data =
    JSON.parse(text);

} catch {

  throw new Error(
    "Gemini 응답 JSON 파싱 실패"
  );
}


const answer =
  data?.candidates?.[0]?.content?.parts
    ?.map(
      part =>
        part.text || ""
    )
    .join("")
    .trim();


if (!answer) {

  console.error(
    "Gemini 응답:",
    JSON.stringify(data)
  );


  throw new Error(
    "Gemini가 답변을 반환하지 않았습니다."
  );
}


console.log(
  "Gemini API 응답 성공"
);


return answer;
```

}

// ==========================================================
// Discord 메시지 전송
// ==========================================================

async sendDiscordMessage(
channelId,
content
) {

```
const token =
  this.env.AI_coupang_discord;


if (!token) {

  throw new Error(
    "AI_coupang_discord 환경변수가 없습니다."
  );
}


const chunks =
  this.splitMessage(
    content,
    1900
  );


for (
  const chunk of chunks
) {

  const response =
    await fetch(
      DISCORD_API +
      "/channels/" +
      channelId +
      "/messages",
      {
        method: "POST",

        headers: {
          "Authorization":
            "Bot " +
            token,

          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({
            content:
              chunk
          })
      }
    );


  if (!response.ok) {

    const errorText =
      await response.text();


    console.error(
      "Discord 메시지 전송 실패 " +
      response.status +
      ":",
      errorText
    );


    throw new Error(
      "Discord API " +
      response.status +
      ": " +
      errorText
    );
  }


  console.log(
    "Discord 메시지 전송 성공"
  );
}
```

}

// ==========================================================
// 대화 저장
// ==========================================================

async saveMessage(message) {

```
const history =
  await this.state.storage.get(
    "chat_history"
  ) || [];


history.push(
  message
);


// 최신 10,000개 유지

const trimmed =
  history.slice(-10000);


await this.state.storage.put(
  "chat_history",
  trimmed
);
```

}

// ==========================================================
// 대화 불러오기
// ==========================================================

async getHistory() {

```
return (
  await this.state.storage.get(
    "chat_history"
  )
) || [];
```

}

// ==========================================================
// 메시지 분할
// ==========================================================

splitMessage(
text,
maxLength
) {

```
if (
  text.length <=
  maxLength
) {
  return [text];
}


const chunks = [];

let remaining =
  text;


while (
  remaining.length >
  maxLength
) {

  let cut =
    remaining.lastIndexOf(
      "\n",
      maxLength
    );


  if (cut < 500) {

    cut =
      remaining.lastIndexOf(
        " ",
        maxLength
      );
  }


  if (cut < 1) {
    cut =
      maxLength;
  }


  chunks.push(
    remaining.slice(
      0,
      cut
    )
  );


  remaining =
    remaining
      .slice(cut)
      .trimStart();
}


if (
  remaining.length >
  0
) {

  chunks.push(
    remaining
  );
}


return chunks;
```

}
}

// ============================================================
// API 서버 메인 페이지
// ============================================================

const CHAT_HISTORY_HTML = `<!DOCTYPE html>

<html lang="ko">

<head>

<meta charset="UTF-8">

<meta
name="viewport"
content="width=device-width, initial-scale=1.0"

>

<title>Coupang AI 서버</title>

<style>

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #f5f6f8;
  color: #202124;
  font-family:
    Arial,
    "Noto Sans KR",
    sans-serif;
}

header {
  position: sticky;
  top: 0;
  z-index: 10;

  padding: 22px;

  background: rgba(255,255,255,.96);

  border-bottom:
    1px solid #ddd;

  backdrop-filter:
    blur(10px);
}

header h1 {
  margin: 0;
  font-size: 24px;
}

header p {
  margin: 6px 0 0;
  color: #777;
}

#status {
  margin-top: 10px;
  font-size: 13px;
  color: #777;
}

#history {
  max-width: 900px;
  margin: 0 auto;

  padding:
    25px 16px 60px;
}

.message {
  margin-bottom: 18px;

  padding:
    17px 19px;

  border-radius: 15px;

  background: white;

  box-shadow:
    0 2px 10px rgba(0,0,0,.05);
}

.message.user {
  border-left:
    5px solid #5865f2;
}

.message.ai {
  border-left:
    5px solid #43a047;
}

.meta {
  display: flex;

  justify-content:
    space-between;

  gap: 10px;

  margin-bottom: 10px;

  font-size: 13px;

  color: #777;
}

.name {
  font-weight: 700;
  color: #333;
}

.content {
  white-space: pre-wrap;
  word-break: break-word;

  line-height: 1.6;
}

.empty {
  padding: 80px 20px;

  text-align: center;

  color: #888;
}

</style>

</head>

<body>

<header>

<h1>Coupang AI 서버</h1>

<p>
Discord AI 대화 기록
</p>

<div id="status">
불러오는 중...
</div>

</header>

<main id="history">

<div class="empty">
대화 기록을 불러오는 중...
</div>

</main>

<script>

function escapeHTML(text) {

  return String(text)

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");
}


function formatDate(timestamp) {

  var date =
    new Date(timestamp);

  return date.toLocaleString(
    "ko-KR",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }
  );
}


async function loadHistory() {

  try {

    var response =
      await fetch(
        "/api/history"
      );


    if (!response.ok) {

      throw new Error(
        "HTTP " +
        response.status
      );
    }


    var messages =
      await response.json();


    var container =
      document.getElementById(
        "history"
      );


    var status =
      document.getElementById(
        "status"
      );


    status.textContent =
      "총 " +
      messages.length +
      "개의 메시지";


    if (
      !messages.length
    ) {

      container.innerHTML =
        '<div class="empty">' +
        '아직 저장된 대화가 없습니다.' +
        '</div>';

      return;
    }


    var html = "";


    messages.forEach(
      function(message) {

        var type =
          message.type === "ai"
            ? "ai"
            : "user";


        var username =
          message.username ||
          (
            type === "ai"
              ? "AI"
              : "사용자"
          );


        html +=
          '<article class="message ' +
          type +
          '">' +

          '<div class="meta">' +

          '<span class="name">' +
          escapeHTML(username) +
          '</span>' +

          '<span>' +
          formatDate(
            message.timestamp
          ) +
          '</span>' +

          '</div>' +

          '<div class="content">' +
          escapeHTML(
            message.content
          ) +
          '</div>' +

          '</article>';
      }
    );


    container.innerHTML =
      html;


  } catch (error) {

    console.error(
      error
    );


    document.getElementById(
      "status"
    ).textContent =
      "대화 기록을 불러오지 못했습니다.";


    document.getElementById(
      "history"
    ).innerHTML =
      '<div class="empty">' +
      '대화 기록을 불러오지 못했습니다.' +
      '</div>';
  }
}


loadHistory();


setInterval(
  loadHistory,
  5000
);

</script>

</body>

</html>`;
