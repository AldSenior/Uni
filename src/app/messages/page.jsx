"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/messages", { withCredentials: true })
      .then((res) => setMessages(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Диалоги</h1>
      <ul className="space-y-2">
        {messages.map((item, i) => (
          <li key={i} className="p-3 border rounded">
            <strong>ID peer: {item.conversation.peer.id}</strong>
            <br />
            Last message text: {item.last_message.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
