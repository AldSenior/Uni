const express = require("express");
const axios = require("axios");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
const { generatePKCE } = require("./utils/pkce");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: "https://uni-eo0p.onrender.com",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "vk_super_secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // secure: true на HTTPS
  }),
);

// 🔗 Авторизация VK ID (начало)
app.get("/auth/vk", (req, res) => {
  const { code_verifier, code_challenge } = generatePKCE();
  req.session.code_verifier = code_verifier;

  const vkAuthUrl = `https://id.vk.com/oauth/authorize?response_type=code&client_id=${process.env.VK_CLIENT_ID}&redirect_uri=${process.env.VK_REDIRECT_URI}&scope=openid,profile,email&code_challenge=${code_challenge}&code_challenge_method=S256`;

  res.redirect(vkAuthUrl);
});

// 🔁 Обмен кода на токен
app.get("/auth/vk/callback", async (req, res) => {
  const { code } = req.query;
  const code_verifier = req.session.code_verifier;

  if (!code || !code_verifier) {
    return res.status(400).json({ error: "Missing code or code_verifier" });
  }

  try {
    const tokenRes = await axios.post(
      "https://api.vk.com/oauth/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.VK_REDIRECT_URI,
        client_id: process.env.VK_CLIENT_ID,
        code_verifier,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const { access_token, id_token, user_id } = tokenRes.data;

    req.session.vk = { access_token, id_token, user_id };

    res.redirect(
      `https://uni-eo0p.onrender.com/vk-callback?token=${access_token}&user_id=${user_id}`,
    );
  } catch (err) {
    console.error(
      "VK Token Exchange Error:",
      err.response?.data || err.message,
    );
    res.status(500).send("Token exchange failed");
  }
});

// 📩 Пример вызова VK API
app.get("/api/status", async (req, res) => {
  const { access_token } = req.session.vk || {};
  if (!access_token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const vkRes = await axios.get(
      "https://api.vk.com/method/status.get?v=5.131",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    res.json(vkRes.data);
  } catch (err) {
    console.error("VK API error:", err.response?.data || err.message);
    res.status(500).json({ error: "VK API failed" });
  }
});

// 🧪 Отладка
app.get("/session", (req, res) => {
  res.json(req.session);
});

app.listen(PORT, () =>
  console.log(`🚀 VK Auth Server running on http://localhost:${PORT}`),
);
