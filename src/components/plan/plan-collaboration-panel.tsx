"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Coins,
  Lightbulb,
  Plus,
  Vote,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { CollaborationBundle } from "@/lib/plans/collaboration/types";
import { Button } from "@/components/ui/button";
import { ExpandableSection } from "@/components/ui/expandable-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ParticipantSelect,
  ReadableSelect,
  type ReadableSelectOption,
} from "@/components/ui/readable-select";
import { CostSettlementSummary } from "@/components/plan/cost-settlement-summary";
import { cn } from "@/lib/utils";

type PlanCollaborationPanelProps = {
  planId: string;
  isOwner: boolean;
  canActInGroup: boolean;
  memberName: string | null;
  participantNames: string[];
  data: CollaborationBundle;
  dayOptions: { id: string; label: string }[];
  onChanged: () => void;
};

export function PlanCollaborationPanel({
  planId,
  isOwner,
  canActInGroup,
  memberName,
  participantNames,
  data,
  dayOptions,
  onChanged,
}: PlanCollaborationPanelProps) {
  const router = useRouter();
  const pending = data.proposals.filter((p) => p.status === "PENDING");

  return (
    <section className="glass-card space-y-4 rounded-2xl border-white/10 p-6">
      <h2 className="font-heading flex items-center gap-2 text-lg font-semibold">
        <Vote className="size-5 text-primary" aria-hidden />
        Grupa
      </h2>
      {!canActInGroup && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100/90">
          Podaj imię u góry strony, aby głosować, dodawać wydatki i propozycje.
        </p>
      )}

      <ExpandableSection
        title="Ankiety"
        subtitle="Każdy uczestnik może dodać ankietę i głosować"
        count={data.polls.length}
        defaultOpen={data.polls.length > 0}
      >
        <PollsBlock
          planId={planId}
          canActInGroup={canActInGroup}
          polls={data.polls}
          onChanged={onChanged}
        />
      </ExpandableSection>

      <ExpandableSection
        title="Propozycje od grupy"
        subtitle="Pomysły do akceptacji przez organizatora"
        count={pending.length > 0 ? pending.length : data.proposals.length}
        defaultOpen={pending.length > 0}
      >
        <ProposalsBlock
          planId={planId}
          isOwner={isOwner}
          canActInGroup={canActInGroup}
          pending={pending}
          all={data.proposals}
          dayOptions={dayOptions}
          onChanged={() => {
            onChanged();
            router.refresh();
          }}
        />
      </ExpandableSection>

      <ExpandableSection
        title="Rozliczenia"
        subtitle="Wspólne wydatki i podział kosztów"
        count={data.costSplits.length}
        defaultOpen={data.costSplits.length > 0}
      >
        <CostSplitsBlock
          planId={planId}
          isOwner={isOwner}
          canActInGroup={canActInGroup}
          memberName={memberName}
          participantNames={participantNames}
          splits={data.costSplits}
          onChanged={onChanged}
        />
      </ExpandableSection>
    </section>
  );
}

function PollsBlock({
  planId,
  canActInGroup,
  polls,
  onChanged,
}: {
  planId: string;
  canActInGroup: boolean;
  polls: CollaborationBundle["polls"];
  onChanged: () => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [question, setQuestion] = useState("");
  const [opts, setOpts] = useState(["", ""]);
  const [creating, setCreating] = useState(false);

  async function createPoll(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    const labels = opts.map((o) => o.trim()).filter(Boolean);
    if (q.length < 3) {
      toast.error("Pytanie musi mieć co najmniej 3 znaki");
      return;
    }
    if (labels.length < 2) {
      toast.error("Dodaj co najmniej dwie opcje odpowiedzi");
      return;
    }
    if (!canActInGroup) {
      toast.error("Podaj imię u góry planu");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(`/api/plans/${planId}/polls`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, options: labels }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Błąd");
      setQuestion("");
      setOpts(["", ""]);
      setShowCreate(false);
      onChanged();
      toast.success("Ankieta utworzona");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd");
    } finally {
      setCreating(false);
    }
  }

  async function vote(pollId: string, optionId: string) {
    if (!canActInGroup) {
      toast.error("Podaj imię u góry planu");
      return;
    }
    try {
      const res = await fetch(`/api/plans/${planId}/polls/${pollId}/vote`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Nie udało się oddać głosu");
      onChanged();
      toast.success("Głos zapisany");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się oddać głosu");
    }
  }

  return (
    <div className="space-y-3">
      {polls.length === 0 && !canActInGroup && (
        <p className="text-sm text-muted-foreground">Brak ankiet.</p>
      )}
      {polls.length === 0 && canActInGroup && (
        <p className="text-sm text-muted-foreground">
          Brak ankiet — dodaj pierwszą poniżej.
        </p>
      )}
      <ul className="space-y-3">
        {polls.map((poll) => (
          <li
            key={poll.id}
            className="rounded-xl border border-white/12 bg-white/[0.04] p-4"
          >
            <p className="font-medium">{poll.question}</p>
            <ul className="mt-3 space-y-2">
              {poll.options.map((opt) => {
                const pct =
                  poll.totalVotes > 0
                    ? Math.round((opt.voteCount / poll.totalVotes) * 100)
                    : 0;
                const selected = poll.myOptionId === opt.id;
                return (
                  <li key={opt.id}>
                    <button
                      type="button"
                      disabled={!canActInGroup}
                      onClick={() => void vote(poll.id, opt.id)}
                      className={cn(
                        "w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors",
                        selected
                          ? "border-primary/50 bg-primary/15"
                          : "border-white/12 hover:bg-white/6",
                        !canActInGroup && "cursor-not-allowed opacity-60",
                      )}
                    >
                      <span className="flex justify-between gap-2">
                        <span>{opt.label}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {opt.voteCount}
                          {poll.totalVotes > 0 ? ` · ${pct}%` : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
      {canActInGroup && (
        <>
          {!showCreate ?
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1 border-white/15"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="size-4" aria-hidden />
              Nowa ankieta
            </Button>
          : <form onSubmit={(e) => void createPoll(e)} className="space-y-3">
              <div>
                <Label className="text-xs">Pytanie</Label>
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="np. Ryby czy pizza?"
                  className="mt-1 border-white/15 bg-white/5"
                />
              </div>
              {opts.map((o, i) => (
                <div key={i}>
                  <Label className="text-xs">Opcja {i + 1}</Label>
                  <Input
                    value={o}
                    onChange={(e) => {
                      const next = [...opts];
                      next[i] = e.target.value;
                      setOpts(next);
                    }}
                    placeholder={`Odpowiedź ${i + 1}`}
                    className="mt-1 border-white/15 bg-white/5"
                  />
                </div>
              ))}
              {opts.length < 4 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpts([...opts, ""])}
                >
                  + opcja
                </Button>
              )}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={creating}>
                  {creating ? "Tworzenie…" : "Utwórz ankietę"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreate(false)}
                >
                  Anuluj
                </Button>
              </div>
            </form>
          }
        </>
      )}
    </div>
  );
}

function ProposalsBlock({
  planId,
  isOwner,
  canActInGroup,
  pending,
  all,
  dayOptions,
  onChanged,
}: {
  planId: string;
  isOwner: boolean;
  canActInGroup: boolean;
  pending: CollaborationBundle["proposals"];
  all: CollaborationBundle["proposals"];
  dayOptions: { id: string; label: string }[];
  onChanged: () => void;
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [dayId, setDayId] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (trimmed.length < 2) {
      toast.error("Tytuł propozycji: min. 2 znaki");
      return;
    }
    if (!canActInGroup) {
      toast.error("Podaj imię u góry planu");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`/api/plans/${planId}/proposals`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmed,
          description: desc.trim() || undefined,
          planDayId: dayId || undefined,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Błąd");
      setTitle("");
      setDesc("");
      setDayId("");
      toast.success("Propozycja wysłana do akceptacji");
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd");
    } finally {
      setSending(false);
    }
  }

  async function review(proposalId: string, action: "approve" | "reject") {
    try {
      const res = await fetch(`/api/plans/${planId}/proposals/${proposalId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Błąd");
      toast.success(action === "approve" ? "Zaakceptowano" : "Odrzucono");
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd");
    }
  }

  return (
    <div className="space-y-3">
      {canActInGroup && (
        <form onSubmit={(e) => void submit(e)} className="space-y-3">
          <div>
            <Label className="text-xs">Pomysł</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="np. Wizyta w muzeum"
              className="mt-1 border-white/15 bg-white/5"
            />
          </div>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Opis (opcjonalnie)"
            rows={2}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm"
          />
          {dayOptions.length > 0 && (
            <ReadableSelect
              label="Dzień w planie (opcjonalnie)"
              value={dayId}
              onChange={setDayId}
              options={[
                { value: "", label: "Bez przypisania do dnia" },
                ...dayOptions.map(
                  (d): ReadableSelectOption => ({
                    value: d.id,
                    label: d.label,
                  }),
                ),
              ]}
            />
          )}
          <Button type="submit" size="sm" disabled={sending}>
            Wyślij do akceptacji
          </Button>
        </form>
      )}
      {isOwner && pending.length > 0 && (
        <ul className="space-y-2">
          <p className="text-xs font-medium text-amber-400/90">Do akceptacji</p>
          {pending.map((p) => (
            <li
              key={p.id}
              className="rounded-xl border border-amber-500/25 bg-amber-500/8 p-4 text-sm"
            >
              <p className="font-medium">{p.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {p.proposedByName}
                {p.description ? ` · ${p.description}` : ""}
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="gap-1"
                  onClick={() => void review(p.id, "approve")}
                >
                  <Check className="size-4" aria-hidden />
                  Akceptuj
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => void review(p.id, "reject")}
                >
                  <X className="size-4" aria-hidden />
                  Odrzuć
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {all.filter((p) => p.status !== "PENDING").length > 0 && (
        <ul className="space-y-1 border-t border-white/10 pt-3 text-sm text-muted-foreground">
          {all
            .filter((p) => p.status !== "PENDING")
            .slice(0, 8)
            .map((p) => (
              <li key={p.id}>
                <span className="text-foreground">{p.title}</span>
                {" — "}
                {p.status === "APPROVED" ? "zaakceptowano" : "odrzucono"}
                {p.proposedByName ? ` (${p.proposedByName})` : ""}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

function CostSplitsBlock({
  planId,
  isOwner,
  canActInGroup,
  memberName,
  participantNames,
  splits,
  onChanged,
}: {
  planId: string;
  isOwner: boolean;
  canActInGroup: boolean;
  memberName: string | null;
  participantNames: string[];
  splits: CollaborationBundle["costSplits"];
  onChanged: () => void;
}) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(memberName ?? "");
  const [selectedSplit, setSelectedSplit] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (memberName && !paidBy) setPaidBy(memberName);
  }, [memberName, paidBy]);

  useEffect(() => {
    if (participantNames.length > 0 && selectedSplit.length === 0) {
      setSelectedSplit([...participantNames]);
    }
  }, [participantNames, selectedSplit.length]);

  function toggleSplit(name: string) {
    setSelectedSplit((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name],
    );
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number.parseFloat(amount.replace(",", "."));
    if (!label.trim()) {
      toast.error("Podaj opis wydatku");
      return;
    }
    if (!paidBy.trim()) {
      toast.error("Wybierz, kto zapłacił");
      return;
    }
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Podaj poprawną kwotę");
      return;
    }
    if (selectedSplit.length < 1) {
      toast.error("Wybierz co najmniej jedną osobę do podziału");
      return;
    }
    if (!canActInGroup) {
      toast.error("Podaj imię u góry planu");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/plans/${planId}/cost-splits`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          amount: parsed,
          paidBy: paidBy.trim(),
          splitBetween: selectedSplit,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Błąd");
      setLabel("");
      setAmount("");
      setSelectedSplit(
        participantNames.length > 0 ? [...participantNames] : [],
      );
      onChanged();
      toast.success("Dodano wydatek");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd");
    } finally {
      setSaving(false);
    }
  }

  async function remove(splitId: string) {
    try {
      const res = await fetch(`/api/plans/${planId}/cost-splits/${splitId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Błąd");
      onChanged();
      toast.success("Usunięto");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się usunąć");
    }
  }

  const perPerson = (amt: number, n: number) =>
    n > 0 ? (amt / n).toFixed(2) : "0";

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {splits.length === 0 && (
          <p className="text-sm text-muted-foreground">Brak rozliczeń.</p>
        )}
        {splits.map((s) => (
          <li
            key={s.id}
            className="rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm"
          >
            <div className="flex justify-between gap-2">
              <span className="font-medium">{s.label}</span>
              <span className="tabular-nums">{s.amount.toFixed(2)} PLN</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Zapłacił: {s.paidBy} · dzielone: {s.splitBetween.join(", ")} (
              ~{perPerson(s.amount, s.splitBetween.length)} PLN/os.)
            </p>
            {isOwner && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 h-7 text-xs text-destructive"
                onClick={() => void remove(s.id)}
              >
                Usuń
              </Button>
            )}
          </li>
        ))}
      </ul>
      {canActInGroup && (
        <form onSubmit={(e) => void add(e)} className="space-y-3 border-t border-white/10 pt-3">
          <div>
            <Label className="text-xs">Opis</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="np. Bilety muzeum"
              className="mt-1 border-white/15 bg-white/5"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Kwota (PLN)</Label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                inputMode="decimal"
                className="mt-1 border-white/15 bg-white/5"
              />
            </div>
            <div>
              {participantNames.length > 0 ?
                <ParticipantSelect
                  label="Zapłacił"
                  value={paidBy || null}
                  allowEmpty
                  emptyLabel="Wybierz osobę…"
                  participants={participantNames}
                  onChange={(v) => setPaidBy(v ?? "")}
                />
              : <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Zapłacił
                  </Label>
                  <Input
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    placeholder="Imię"
                    className="h-10 border-white/20 bg-white/8"
                  />
                </div>
              }
            </div>
          </div>
          <div>
            <Label className="text-xs">Podział między uczestników</Label>
            {participantNames.length > 0 ?
              <div className="mt-2 flex flex-wrap gap-2">
                {participantNames.map((n) => {
                  const selected = selectedSplit.includes(n);
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => toggleSplit(n)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm transition-colors",
                        selected
                          ? "border-primary/50 bg-primary/15 text-foreground"
                          : "border-white/15 text-muted-foreground hover:border-white/25",
                      )}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            : <Input
                value={selectedSplit.join(", ")}
                onChange={(e) =>
                  setSelectedSplit(
                    e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
                placeholder="Anna, Bartek"
                className="mt-1 border-white/15 bg-white/5"
              />
            }
          </div>
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? "Zapisywanie…" : "Dodaj wydatek"}
          </Button>
        </form>
      )}
      <CostSettlementSummary splits={splits} />
    </div>
  );
}
