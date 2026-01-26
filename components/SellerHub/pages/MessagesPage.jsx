"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SellerHubPageHeader from "@/components/SellerHub/SellerHubPageHeader";
import { sellerHubApi } from "@/utils/api";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

const MessagesPage = () => {
  const searchParams = useSearchParams();
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [meta, setMeta] = useState({ page: 1, perPage: 20, total: 0 });

  useEffect(() => {
    const urlQuery = searchParams.get("query") || "";
    if (urlQuery !== query) {
      setQuery(urlQuery);
      setPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    const fetchThreads = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await sellerHubApi.getMessages({
          page,
          perPage,
          query: query || undefined,
        });
        const payload = response?.data?.data ?? response?.data;
        const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
        const nextMeta = payload?.meta || {
          page,
          perPage,
          total: Array.isArray(list) ? list.length : 0,
        };
        if (isMounted) {
          setThreads(list);
          setActiveId((prev) => prev ?? list[0]?.id ?? null);
          setMeta(nextMeta);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load messages.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchThreads();
    return () => {
      isMounted = false;
    };
  }, [page, perPage, query]);

  useEffect(() => {
    let isMounted = true;
    const fetchThread = async () => {
      if (!activeId) {
        setMessages([]);
        return;
      }
      try {
        const response = await sellerHubApi.getThread(activeId, { page: 1, perPage: 50 });
        const payload = response?.data?.data ?? response?.data;
        const list = Array.isArray(payload?.messages)
          ? payload.messages
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload)
              ? payload
              : [];
        if (isMounted) {
          setMessages(list);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load thread.");
        }
      }
    };
    fetchThread();
    return () => {
      isMounted = false;
    };
  }, [activeId]);

  const filteredThreads = useMemo(() => {
    if (!query) return threads;
    const q = query.toLowerCase();
    return threads.filter((thread) => {
      return (
        thread?.buyer?.toLowerCase?.().includes(q) ||
        thread?.subject?.toLowerCase?.().includes(q)
      );
    });
  }, [threads, query]);

  const handleSend = async () => {
    if (!messageText.trim()) return;
    try {
      await sellerHubApi.sendMessage({
        thread_id: activeId,
        body: messageText.trim(),
      });
      setMessageText("");
      const refresh = await sellerHubApi.getThread(activeId, { page: 1, perPage: 50 });
      const payload = refresh?.data?.data ?? refresh?.data;
      const list = Array.isArray(payload?.messages)
        ? payload.messages
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      setMessages(list);
      toast.success("Message sent.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send message.");
    }
  };

  return (
    <div className="space-y-6">
      <SellerHubPageHeader
        title="Messages"
        description="Stay connected with buyers and resolve questions fast."
      />

      {error && (
        <Card>
          <CardContent className="py-3 text-sm text-red-600">{error}</CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardContent className="py-4">
            <Input
              placeholder="Search conversations"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="mt-4 space-y-2">
              {filteredThreads.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setActiveId(conversation.id)}
                  className={`w-full rounded-md border px-3 py-2 text-left transition ${
                    activeId === conversation.id
                      ? "border-primary/30 bg-primary/5"
                      : "border-transparent hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">
                      {conversation.buyer || "Buyer"}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {conversation.lastMessageAt || conversation.updated_at || ""}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{conversation.subject}</p>
                  <p className="text-xs text-slate-600">{conversation.preview}</p>
                </button>
              ))}
              {!isLoading && filteredThreads.length === 0 && (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  No conversations found.
                </p>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing {filteredThreads.length} of {meta.total || filteredThreads.length}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page * perPage >= (meta.total || 0)}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardContent className="flex-1 space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "seller" || message.sender === "me"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${
                    message.sender === "seller" || message.sender === "me"
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-900"
                  }`}
                >
                  <p>{message.text || message.body}</p>
                  <span className="mt-1 block text-[10px] opacity-70">
                    {message.time || message.sent_at || message.created_at || ""}
                  </span>
                </div>
              </div>
            ))}
            {!isLoading && messages.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No messages in this thread yet.
              </p>
            )}
          </CardContent>
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message"
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
              />
              <Button onClick={handleSend} disabled={!activeId || !messageText.trim()}>
                Send
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MessagesPage;
