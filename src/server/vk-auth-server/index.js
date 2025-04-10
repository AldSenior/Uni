// Express сервер с VK LongPoll (одиночное соединение только для себя)
const express = require("express");
const easyvk = require("easyvk");
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const server = http.createServer(app);
app.use(cors({ origin: "http://localhost:3000" }));
app.use(bodyParser.json());
const port = process.env.PORT || 3001;

let latestTs = null;
let pollingStarted = false;
let connectedClient = null;

// Хранение последнего токена и user_id
let activeToken = null;
let activeUserId = null;

const startLongPoll = async () => {
  if (!activeToken || !activeUserId || pollingStarted) return;

  pollingStarted = true;
  const vk = await easyvk({ token: activeToken, vk_api_version: "5.131" });

  const serverInfo = await vk.call("messages.getLongPollServer");
  latestTs = serverInfo.ts;
  const { server: lpServer, key } = serverInfo;

  const poll = async () => {
    try {
      const response = await fetch(
        `https://${lpServer}?act=a_check&key=${key}&ts=${latestTs}&wait=25&mode=2&version=3`,
      );
      const data = await response.json();

      if (data.updates && Array.isArray(data.updates)) {
        for (const update of data.updates) {
          if (update[0] === 4) {
            const message = {
              id: update[1],
              flags: update[2],
              peer_id: update[3],
              timestamp: update[4],
              text: update[5],
              attachments: update[6],
            };

            connectedClient?.res?.write(`data: ${JSON.stringify(message)}\n\n`);
          }
        }
      }

      latestTs = data.ts;
      setImmediate(poll);
    } catch (err) {
      console.error("Ошибка в LongPoll:", err);
      setTimeout(poll, 5000);
    }
  };

  poll();
};

// SSE подключение
app.get("/events", (req, res) => {
  const { token, user_id } = req.query;
  if (!token || !user_id) {
    return res.status(400).json({ error: "Нужны token и user_id" });
  }

  activeToken = token;
  activeUserId = user_id;
  connectedClient = { res };

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  startLongPoll();

  req.on("close", () => {
    console.log("SSE клиент отключился");
    connectedClient = null;
  });
});

// Остальной функционал API как есть
// Авторизация
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Требуются логин и пароль" });
  }

  try {
    const vk = await easyvk({
      username,
      password,
      vk_api_version: "5.131",
      authScope: "messages",
    });

    if (!vk.session.first_name) {
      return res
        .status(401)
        .json({
          status: "error",
          message: "Не удалось получить данные пользователя VK",
        });
    }

    res.json({
      status: "success",
      user: `${vk.session.first_name} ${vk.session.last_name}`,
      token: vk.session.access_token,
    });
  } catch (error) {
    res
      .status(401)
      .json({
        status: "error",
        message: "Ошибка авторизации",
        details: error.message,
      });
  }
});

app.get("/messages", async (req, res) => {
  const { token, offset = 0, count = 200 } = req.query;
  if (!token)
    return res
      .status(400)
      .json({ status: "error", message: "Не передан токен" });
  try {
    const vk = await easyvk({ token, vk_api_version: "5.131" });
    const response = await vk.call("messages.getConversations", {
      offset: parseInt(offset),
      count: parseInt(count),
    });
    res.json({ status: "success", items: response.items });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/history", async (req, res) => {
  const { token, user_id } = req.query;
  if (!token || !user_id)
    return res
      .status(400)
      .json({ status: "error", message: "Нужны token и user_id" });
  try {
    const vk = await easyvk({ token, vk_api_version: "5.131" });
    const response = await vk.call("messages.getHistory", {
      user_id,
      count: 200,
      rev: 1,
    });
    res.json({ status: "success", messages: response.items });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.post("/send", async (req, res) => {
  const { token, user_id, message } = req.body;
  if (!token || !user_id || !message)
    return res
      .status(400)
      .json({ status: "error", message: "Недостаточно данных" });
  try {
    const vk = await easyvk({ token, vk_api_version: "5.131" });
    await vk.call("messages.send", {
      user_id,
      message,
      random_id: easyvk.randomId(),
    });
    res.json({ status: "success" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/user", async (req, res) => {
  const { token, user_id } = req.query;
  if (!token || !user_id)
    return res
      .status(400)
      .json({ status: "error", message: "Нужны token и user_id" });
  try {
    const vk = await easyvk({ token, vk_api_version: "5.131" });
    const uid = parseInt(user_id, 10);
    if (uid > 2000000000) {
      const response = await vk.call("messages.getConversations", {
        peer_ids: uid,
        extended: 1,
      });
      const item = response.items?.[0];
      return res.json({
        status: "success",
        name: item?.conversation?.chat_settings?.title || "Групповой чат",
        photo: item?.conversation?.chat_settings?.photo?.photo_100,
      });
    } else if (uid < 0) {
      const response = await vk.call("groups.getById", {
        group_id: Math.abs(uid),
        fields: "photo_100",
      });
      const group = response[0];
      return res.json({
        status: "success",
        name: group.name,
        photo: group.photo_100,
      });
    } else {
      const response = await vk.call("users.get", {
        user_ids: uid,
        fields: "photo_100",
      });
      const user = response[0];
      return res.json({
        status: "success",
        name: `${user.first_name} ${user.last_name}`,
        photo: user.photo_100,
      });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

server.listen(port, () => {
  console.log(`🚀 Сервер с SSE слушает http://localhost:${port}`);
});
