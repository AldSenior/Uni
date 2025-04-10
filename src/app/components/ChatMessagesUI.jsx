"use client";
import { VStack, HStack, Avatar, Text } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { useMessagesStore } from "../store/messageStoreVK/useMessageStore";

export const ChatMessagesUI = ({ selectedUserId }) => {
  const messages = useMessagesStore((s) => s.messages);
  const participants = useMessagesStore((s) => s.participants);

  const messagesEndRef = useRef();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <VStack
      align="start"
      spacing={3}
      bg="gray.700"
      p={4}
      h="60vh"
      overflowY="auto"
      borderRadius="md"
    >
      {messages.map((msg, idx) => {
        const sender = participants[msg.from_id] || {};
        const displayName =
          msg.from_id === selectedUserId
            ? sender.name || `ID ${msg.from_id}`
            : msg.from_id === msg.peer_id
              ? "Вы"
              : sender.name || `ID ${msg.from_id}`;

        return (
          <HStack key={idx} align="start" spacing={3} w="100%">
            <Avatar size="xs" src={sender.photo || "/vk-logo.svg"} />
            <Text>
              <b>{displayName}</b>: {msg.text}
            </Text>
          </HStack>
        );
      })}
      <div ref={messagesEndRef} />
    </VStack>
  );
};
