"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, MessageCircle, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };

type PlanAssistantPanelProps = {
  planId: string;
};

const STARTERS = [
  "Co warto zmienić w planie?",
  "Gdzie zjeść kolację blisko centrum?",
  "Czy tempo jest realne?",
  "Co spakować na ten kierunek?",
];

export function PlanAssistantPanel({ planId }: PlanAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const chatMutation = useMutation({
    mutationFn: async (nextMessages: Message[]) => {
      const res = await fetch(`/api/plans/${planId}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const json = (await res.json()) as {
        reply?: string;
        suggestions?: string[] | null;
        error?: string;
      };
      if (!res.ok) throw new Error(json.error ?? "Błąd asystenta");
      return json as { reply: string; suggestions?: string[] | null };
    },
    onSuccess: (data, sentMessages) => {
      setMessages([
        ...sentMessages,
        { role: "assistant", content: data.reply },
      ]);
    },
  });

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || chatMutation.isPending) return;

    const next: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    chatMutation.mutate(next);
  }

  const lastSuggestions =
    chatMutation.data?.suggestions?.filter(Boolean) ?? [];

  return (
    <Card className="glass-card border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-heading text-lg">
          <Sparkles className="size-4 text-primary" aria-hidden />
          Asystent podróży
        </CardTitle>
        <CardDescription>
          Pytaj o plan, jedzenie, tempo — odpowiedzi na podstawie Twojego harmonogramu.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {STARTERS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs transition-colors hover:border-primary/40 hover:bg-primary/10"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-3">
          {messages.length === 0 && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="size-4 shrink-0" aria-hidden />
              Zadaj pytanie o swój plan
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "rounded-lg px-3 py-2 text-sm",
                m.role === "user" ?
                  "ml-4 bg-primary/15 text-foreground"
                : "mr-4 bg-white/5 text-muted-foreground",
              )}
            >
              {m.content}
            </div>
          ))}
          {chatMutation.isPending && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" aria-hidden />
              Piszę odpowiedź…
            </p>
          )}
        </div>

        {lastSuggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {lastSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="text-xs text-primary underline-offset-2 hover:underline"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="np. Ułatw dzień 2 — mniej chodzenia"
            rows={2}
            maxLength={2000}
            className="min-h-[2.5rem] flex-1 resize-none rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || chatMutation.isPending}
            className="shrink-0 self-end"
            aria-label="Wyślij"
          >
            <Send className="size-4" aria-hidden />
          </Button>
        </form>
        {chatMutation.isError && (
          <p className="text-xs text-destructive">{chatMutation.error.message}</p>
        )}
      </CardContent>
    </Card>
  );
}
