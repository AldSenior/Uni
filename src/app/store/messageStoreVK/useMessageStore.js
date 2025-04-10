"use client";
import { create } from "zustand";
import {
  Box,
  Text,
  HStack,
  Avatar,
  VStack,
  Flex,
  Textarea,
  Button,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

export const useMessagesStore = create((set, get) => ({
  messages: [],
  participants: {},

  setMessages: (msgs) => {
    const uniqueSenders = Array.from(new Set(msgs.map((m) => m.from_id)));
    uniqueSenders.forEach((id) => get().fetchSender(id));
    set({ messages: msgs });
  },

  addMessage: (msg) => {
    if (!get().participants[msg.from_id]) {
      get().fetchSender(msg.from_id);
    }
    set((state) => ({
      messages: [...state.messages, msg],
    }));
  },

  clearMessages: () => set({ messages: [] }),

  setSender: (id, name, photo) => {
    set((state) => ({
      participants: {
        ...state.participants,
        [id]: { name, photo },
      },
    }));
  },

  fetchSender: async (fromId) => {
    try {
      const token = localStorage.getItem("vk_token");
      const res = await fetch(
        `http://localhost:3001/user?token=${token}&user_id=${fromId}`,
      );
      const data = await res.json();
      if (data.status === "success") {
        get().setSender(fromId, data.name, data.photo);
      }
    } catch (err) {
      console.error("Ошибка загрузки отправителя:", err);
    }
  },

  eventSource: null,
  connectSSE: (token) => {
    try {
      const source = new EventSource(
        `http://localhost:3001/events?token=${token}`,
      );

      source.onmessage = (e) => {
        try {
          const message = JSON.parse(e.data);
          get().addMessage(message);
        } catch (err) {
          console.error("Ошибка парсинга SSE-сообщения:", err);
        }
      };

      source.onerror = (err) => {
        console.error("SSE ошибка:", err);
        source.close();
      };

      set({ eventSource: source });
    } catch (err) {
      console.error("Ошибка инициализации SSE:", err);
    }
  },

  disconnectSSE: () => {
    set((state) => {
      if (state.eventSource) state.eventSource.close();
      return { eventSource: null };
    });
  },
}));
