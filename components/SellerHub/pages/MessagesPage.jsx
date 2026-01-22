"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SellerHubPageHeader from "@/components/SellerHub/SellerHubPageHeader";
import { conversations } from "@/components/SellerHub/sellerHubData";

const MessagesPage = () => {
  const [activeId, setActiveId] = useState(conversations[0]?.id);
  const activeConversation = conversations.find((c) => c.id === activeId);

  return (
    <div className="space-y-6">
      <SellerHubPageHeader
        title="Messages"
        description="Stay connected with buyers and resolve questions fast."
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardContent className="py-4">
            <Input placeholder="Search conversations" />
            <div className="mt-4 space-y-2">
              {conversations.map((conversation) => (
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
                      {conversation.buyer}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {conversation.lastMessageAt}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{conversation.subject}</p>
                  <p className="text-xs text-slate-600">{conversation.preview}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardContent className="flex-1 space-y-4 py-4">
            {activeConversation?.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "seller" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${
                    message.sender === "seller"
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-900"
                  }`}
                >
                  <p>{message.text}</p>
                  <span className="mt-1 block text-[10px] opacity-70">
                    {message.time}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input placeholder="Type a message" />
              <Button>Send</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MessagesPage;
