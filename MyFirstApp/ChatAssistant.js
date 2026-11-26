import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { safeRole } from "./accessibility";

// Set this to the deployed Vercel API URL before building a native app.
const MOBILE_CHAT_API_URL = "http://192.168.1.13:8000/api/chat";
const LOCAL_CHAT_API_URL = "http://127.0.0.1:8000/api/chat";

const INITIAL_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! Ask me about Taskeen's skills, education, projects, and contact details.",
};

const USER_BUBBLE_COLOR = "#1f2937";
const HEADER_COLOR = "#111827";
const LOCAL_API_ERROR =
  "The local chat API is not running. Start it with `npm run api:dev` in another terminal.";

export default function ChatAssistant({ colors }) {
  const { width, height } = useWindowDimensions();
  const isLocalWeb =
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");
  const scrollRef = useRef(null);
  const loadingRef = useRef(false);
  const nextMessageId = useRef(0);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const panelWidth = Math.min(400, width * 0.92, Math.max(width - 24, 0));
  const panelRight =
    width < 440 ? Math.max(12, (width - panelWidth) / 2) : 20;
  const panelHeight = Math.min(560, Math.max(180, height * 0.72));

  const createMessage = (role, content, isError = false) => ({
    id: `message-${nextMessageId.current++}`,
    role,
    content,
    isError,
  });

  const handleSend = async () => {
    const content = input.trim();
    if (!content || loadingRef.current) return;

    const userMessage = createMessage("user", content);
    const conversation = [
      ...messages.filter(
        (message) => message.id !== INITIAL_MESSAGE.id && !message.isError,
      ),
      userMessage,
    ]
      .slice(-10)
      .map(({ role, content: messageContent }) => ({
        role,
        content: messageContent,
      }));

    loadingRef.current = true;
    setLoading(true);
    setInput("");
    setMessages((currentMessages) => [...currentMessages, userMessage]);

    try {
      const apiUrl =
        Platform.OS === "web"
          ? isLocalWeb
            ? LOCAL_CHAT_API_URL
            : "/api/chat"
          : MOBILE_CHAT_API_URL;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation }),
      });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          isLocalWeb
            ? LOCAL_API_ERROR
            : "The /api/chat endpoint is unavailable. Start the local API with `npm run api:dev`, or deploy and configure the chat API.",
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Chat request failed (${response.status}).`);
      }

      if (typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("The chat service returned an empty reply.");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage("assistant", data.reply.trim()),
      ]);
    } catch (error) {
      console.error("Ask AI request failed.", error);
      const isLocalApiUnavailable =
        isLocalWeb &&
        (error instanceof TypeError || error.message === LOCAL_API_ERROR);
      const errorMessage = isLocalApiUnavailable
        ? LOCAL_API_ERROR
        : error instanceof Error &&
            !(error instanceof TypeError) &&
            error.message
          ? error.message
          : "Sorry, I couldn't connect right now. Please try again or contact Taskeen at taskeenullah373@gmail.com.";
      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage("assistant", errorMessage, true),
      ]);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (loadingRef.current) return;
    setMessages([INITIAL_MESSAGE]);
    setInput("");
  };

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      {isOpen && (
        <View
          accessibilityLabel="Ask AI chat"
          style={[
            styles.panel,
            {
              width: panelWidth,
              height: panelHeight,
              right: panelRight,
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Ask AI</Text>
            <View style={styles.headerActions}>
              <Pressable
                accessibilityRole={safeRole("button")}
                accessibilityLabel="Clear chat"
                accessibilityState={{ disabled: loading }}
                disabled={loading}
                onPress={clearChat}
                style={({ pressed }) => [
                  styles.headerButton,
                  pressed && styles.pressedButton,
                  loading && styles.disabledButton,
                ]}
              >
                <Text style={styles.headerButtonText}>Clear</Text>
              </Pressable>
              <Pressable
                accessibilityRole={safeRole("button")}
                accessibilityLabel="Close chat"
                onPress={() => setIsOpen(false)}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.pressedButton,
                ]}
              >
                <Text style={styles.headerButtonText}>X</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              scrollRef.current?.scrollToEnd({ animated: true })
            }
          >
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <View
                  key={message.id}
                  style={[
                    styles.messageRow,
                    isUser ? styles.userMessageRow : styles.assistantMessageRow,
                  ]}
                >
                  <Text
                    accessibilityRole={safeRole("text")}
                    style={[
                      styles.messageBubble,
                      isUser
                        ? styles.userBubble
                        : [
                            styles.assistantBubble,
                            {
                              backgroundColor: colors.card,
                              borderColor: colors.border,
                            },
                          ],
                      message.isError && styles.errorBubble,
                      { color: isUser ? "#ffffff" : colors.text },
                    ]}
                  >
                    {message.content}
                  </Text>
                </View>
              );
            })}
            {loading && (
              <View
                accessibilityLiveRegion="polite"
                style={[styles.messageRow, styles.assistantMessageRow]}
              >
                <View
                  style={[
                    styles.loadingBubble,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <ActivityIndicator size="small" color={colors.accent} />
                  <Text style={{ color: colors.muted }}>Thinking...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View
            style={[
              styles.composer,
              { borderTopColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <TextInput
              accessibilityLabel="Type your question"
              placeholder="Type your question..."
              placeholderTextColor={colors.muted}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              blurOnSubmit
              editable={!loading}
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
            />
            <Pressable
              accessibilityRole={safeRole("button")}
              accessibilityLabel="Send message"
              accessibilityState={{ disabled: loading || !input.trim() }}
              disabled={loading || !input.trim()}
              onPress={handleSend}
              style={({ pressed }) => [
                styles.sendButton,
                { backgroundColor: colors.accent },
                pressed && styles.pressedButton,
                (loading || !input.trim()) && styles.disabledButton,
              ]}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </Pressable>
          </View>
        </View>
      )}

      <Pressable
        accessibilityRole={safeRole("button")}
        accessibilityLabel={isOpen ? "Close Ask AI chat" : "Open Ask AI chat"}
        accessibilityState={{ expanded: isOpen }}
        onPress={() => setIsOpen((open) => !open)}
        style={({ pressed }) => [
          styles.floatingButton,
          {
            right: panelRight,
            backgroundColor: colors.accent,
          },
          pressed && styles.floatingButtonPressed,
        ]}
      >
        <Text style={[styles.floatingButtonText, { color: colors.buttonText }]}>
          {isOpen ? "X" : "AI"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  panel: {
    position: "absolute",
    bottom: 88,
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: 18,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 12,
  },
  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: HEADER_COLOR,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  headerButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    gap: 12,
    padding: 14,
  },
  messageRow: {
    width: "100%",
    flexDirection: "row",
  },
  userMessageRow: {
    justifyContent: "flex-end",
  },
  assistantMessageRow: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "86%",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    fontSize: 14,
    lineHeight: 20,
    overflow: "hidden",
  },
  userBubble: {
    backgroundColor: USER_BUBBLE_COLOR,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  errorBubble: {
    borderColor: "#d97706",
  },
  loadingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 14,
  },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 42,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 14,
  },
  sendButton: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  sendButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 29,
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  floatingButtonText: {
    fontSize: 16,
    fontWeight: "800",
  },
  floatingButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
  pressedButton: {
    opacity: 0.75,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
