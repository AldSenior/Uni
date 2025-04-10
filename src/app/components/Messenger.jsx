"use client";
import {
  Box,
  Flex,
  Avatar,
  Text,
  Textarea,
  Button,
  VStack,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMessagesStore } from "../store/messageStoreVK/useMessageStore";
import { ChatMessagesUI } from "../components/ChatMessagesUI";

export default function Messenger() {
  const [dialogs, setDialogs] = useState([]);
  const [dialogNames, setDialogNames] = useState({});
  const [dialogPhotos, setDialogPhotos] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const toast = useToast();
  const router = useRouter();
  const messagesEndRef = useRef();
  const { messages, setMessages, addMessage, clearMessages } =
    useMessagesStore();

  useEffect(() => {
    const token = localStorage.getItem("vk_token");
    const user = localStorage.getItem("vk_user");
    if (!token || !user) return router.push("/");
    fetchDialogs(token);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("vk_token");
    if (selectedUserId && token) {
      fetchHistory(token, selectedUserId).then(() => {
        setupSSE(token, selectedUserId);
      });
    }
    return () => {
      if (typeof window !== "undefined" && window.sse) {
        window.sse.close();
        window.sse = null;
      }
    };
  }, [selectedUserId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const setupSSE = (token, userId) => {
    if (typeof window === "undefined") return;
    if (window.sse) window.sse.close();

    const sse = new EventSource(`http://localhost:3001/events?token=${token}`);

    sse.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.peer_id === userId) {
        addMessage(data);
        toast({
          title: "Новое сообщение",
          description: data.text,
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    sse.onerror = (err) => {
      console.error("SSE ошибка:", err);
      sse.close();
    };

    window.sse = sse;
  };

  const fetchDialogs = async (token) => {
    let all = [];
    let offset = 0;
    const count = 100;
    let nameMap = {},
      photoMap = {};

    while (true) {
      const res = await fetch(
        `http://localhost:3001/messages?token=${token}&offset=${offset}&count=${count}`,
      );
      const data = await res.json();
      if (!data.items?.length) break;
      all = [...all, ...data.items];
      offset += count;
    }

    setDialogs(all);
    for (let d of all) {
      const id = d.conversation.peer.id;
      if (d.conversation.chat_settings) {
        nameMap[id] = d.conversation.chat_settings.title;
        photoMap[id] = d.conversation.chat_settings.photo?.photo_100;
      } else {
        const res = await fetch(
          `http://localhost:3001/user?token=${token}&user_id=${id}`,
        );
        const data = await res.json();
        if (data.status === "success") {
          nameMap[id] = data.name;
          photoMap[id] = data.photo;
        }
      }
    }
    setDialogNames(nameMap);
    setDialogPhotos(photoMap);
  };

  const fetchHistory = async (token, userId) => {
    clearMessages();
    const res = await fetch(
      `http://localhost:3001/history?token=${token}&user_id=${userId}`,
    );
    const data = await res.json();
    if (data.status === "success") setMessages(data.messages);
  };

  const sendReply = async () => {
    const token = localStorage.getItem("vk_token");
    if (!token || !replyMessage.trim()) return;
    const res = await fetch("http://localhost:3001/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        user_id: selectedUserId,
        message: replyMessage,
      }),
    });
    const data = await res.json();
    if (data.status === "success") setReplyMessage("");
    else toast({ title: "Ошибка", description: data.message, status: "error" });
  };

  return (
    <Flex h="100vh" bg="gray.900" color="white" p={4} gap={4}>
      <VStack
        w="30%"
        bg="gray.800"
        borderRadius="lg"
        p={4}
        spacing={3}
        overflowY="auto"
      >
        {dialogs.map((d, i) => {
          const id = d.conversation.peer.id;
          const name = dialogNames[id] || `ID ${id}`;
          const photo = dialogPhotos[id];
          return (
            <HStack
              key={i}
              w="full"
              p={2}
              borderRadius="md"
              bg={selectedUserId === id ? "blue.600" : "gray.700"}
              cursor="pointer"
              onClick={() => {
                setSelectedUserId(id);
                setSelectedUserName(name);
              }}
            >
              <Avatar size="sm" src={photo} />
              <Box>
                <Text fontWeight="bold">{name}</Text>
                <Text fontSize="sm" color="gray.300" noOfLines={1}>
                  {d.last_message?.text || "(без текста)"}
                </Text>
              </Box>
            </HStack>
          );
        })}
      </VStack>

      <Box w="70%">
        {selectedUserId ? (
          <Box bg="gray.800" p={4} borderRadius="lg">
            <Text mb={2} fontWeight="bold">
              Чат с: {selectedUserName}
            </Text>
            <ChatMessagesUI selectedUserId={selectedUserId} />
            <Textarea
              placeholder="Ваше сообщение..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              bg="gray.600"
              mt={4}
              color="white"
            />
            <Button mt={2} colorScheme="green" onClick={sendReply}>
              Отправить
            </Button>
          </Box>
        ) : (
          <Text>Выберите диалог слева</Text>
        )}
      </Box>
    </Flex>
  );
}
