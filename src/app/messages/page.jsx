"use client";
import { useEffect, useState } from "react";

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/messages", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setMessages(data.items);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMessages();
  }, []);

  return (
    <div>
      <h1>Messages</h1>
      {messages.map((msg) => (
        <div key={msg.conversation.peer.id}>{msg.last_message.text}</div>
      ))}
    </div>
  );
}
