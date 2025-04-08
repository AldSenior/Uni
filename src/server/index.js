const express = require("express");
const axios = require("axios");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: "https://uni-eo0p.onrender.com",
    credentials: true,
  }),
);

app.use(express.json());
app.use(
  session({
    secret: "vk_secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  }),
);

// 🔗 OAuth Redirect
app.get("/auth/vk", (req, res) => {
  const vkAuthUrl = `https://oauth.vk.com/authorize?client_id=${process.env.VK_CLIENT_ID}&display=page&redirect_uri=${process.env.VK_REDIRECT_URI}&scope=messages&response_type=code&v=5.131`;
  res.redirect(vkAuthUrl);
});

// 🔁 VK Callback
app.get("/auth/vk/callback", async (req, res) => {
  const { code } = req.query;

  try {
    const response = await axios.get("https://oauth.vk.com/access_token", {
      params: {
        client_id: process.env.VK_CLIENT_ID,
        client_secret: process.env.VK_CLIENT_SECRET,
        redirect_uri: process.env.VK_REDIRECT_URI,
        code,
      },
    });

    // Временно сохраняем токен в query
    const access_token = response.data.access_token;
    const user_id = response.data.user_id;

    // ✅ Перенаправим обратно на фронт с токеном в query или лучше JWT
    res.redirect(
      `https://uni-eo0p.onrender.com/vk-callback?token=${access_token}&user_id=${user_id}`,
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("VK OAuth Error");
  }
});
app.post("/api/save-token", (req, res) => {
  const { token, user_id } = req.body;
  if (!token) return res.status(400).json({ error: "No token" });

  req.session.vk = { access_token: token, user_id };
  res.json({ ok: true });
});

// 📩 Messages API
app.get("/api/messages", async (req, res) => {
  const { vk } = req.session;
  if (!vk || !vk.access_token)
    return res.status(401).json({ error: "Unauthorized" });

  try {
    const messages = await axios.get(
      "https://api.vk.com/method/messages.getConversations",
      {
        params: {
          access_token: vk.access_token,
          v: "5.131",
          count: 10,
        },
      },
    );

    res.json(messages.data.response.items);
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: "VK API Error" });
  }
});

app.listen(3001, () =>
  console.log("🚀 Express running on http://localhost:3001"),
);
