"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SellerHubPageHeader from "@/components/SellerHub/SellerHubPageHeader";
import { sellerHubApi } from "@/utils/api";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { Mail, Search, Send, RefreshCw, Loader2, User, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() || !activeId) return;
    try {
      setIsSending(true);
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
      toast.success("Message sent successfully.");
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPage(1);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SellerHubPageHeader
          title="Messages"
          description="Stay connected with buyers and resolve questions fast."
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="py-3 text-sm text-red-600 dark:text-red-400">{error}</CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="border-2 shadow-sm">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Conversations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="py-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-10"
              />
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredThreads.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setActiveId(conversation.id)}
                  className={cn(
                    "w-full rounded-lg border-2 px-3 py-3 text-left transition-all duration-200",
                    activeId === conversation.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-transparent hover:border-primary/30 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {conversation.buyer || "Buyer"}
                        </p>
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                          {conversation.lastMessageAt || conversation.updated_at || ""}
                        </span>
                      </div>
                      {conversation.subject && (
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 truncate">
                          {conversation.subject}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {conversation.preview || "No preview available"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
              {!isLoading && filteredThreads.length === 0 && (
                <div className="py-12 text-center">
                  <Mail className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground font-medium">No conversations found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {query ? "Try adjusting your search" : "Messages will appear here"}
                  </p>
                </div>
              )}
            </div>
            {filteredThreads.length > 0 && (
              <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {filteredThreads.length} of {meta.total || filteredThreads.length}
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
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col border-2 shadow-sm">
          {activeId ? (
            <>
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Conversation
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 py-4 overflow-y-auto max-h-[600px]">
                {messages.map((message) => {
                  const isSeller = message.sender === "seller" || message.sender === "me";
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        isSeller ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] rounded-xl px-4 py-3 text-sm shadow-sm",
                          isSeller
                            ? "bg-primary text-white rounded-br-sm"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm"
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.text || message.body}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <Clock className={cn(
                            "h-3 w-3",
                            isSeller ? "text-white/70" : "text-muted-foreground"
                          )} />
                          <span className={cn(
                            "text-[10px]",
                            isSeller ? "text-white/70" : "text-muted-foreground"
                          )}>
                            {message.time || message.sent_at || message.created_at || ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
                {!isLoading && messages.length === 0 && (
                  <div className="py-12 text-center">
                    <Mail className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground font-medium">No messages yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Start the conversation by sending a message
                    </p>
                  </div>
                )}
              </CardContent>
              <div className="border-t p-4 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    disabled={isSending}
                  />
                  <Button 
                    onClick={handleSend} 
                    disabled={!activeId || !messageText.trim() || isSending}
                    className="gap-2"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center py-12">
              <div className="text-center">
                <Mail className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground font-medium">Select a conversation</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose a conversation from the list to view messages
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MessagesPage;
