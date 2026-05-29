export type CostSplitForSettlement = {
  amount: number;
  paidBy: string;
  splitBetween: string[];
};

export type SettlementTransfer = {
  from: string;
  to: string;
  amount: number;
};

/** Salda i minimalne przelewy „kto komu ile oddaje”. */
export function computeCostSettlements(
  splits: CostSplitForSettlement[],
): SettlementTransfer[] {
  const balances = new Map<string, number>();

  const touch = (name: string) => {
    if (!balances.has(name)) balances.set(name, 0);
  };

  for (const s of splits) {
    const count = s.splitBetween.length;
    if (count === 0 || s.amount <= 0) continue;
    const share = s.amount / count;
    touch(s.paidBy);
    balances.set(s.paidBy, (balances.get(s.paidBy) ?? 0) + s.amount);
    for (const person of s.splitBetween) {
      touch(person);
      balances.set(person, (balances.get(person) ?? 0) - share);
    }
  }

  const creditors: { name: string; amount: number }[] = [];
  const debtors: { name: string; amount: number }[] = [];

  for (const [name, raw] of balances) {
    const bal = Math.round(raw * 100) / 100;
    if (bal > 0.005) creditors.push({ name, amount: bal });
    else if (bal < -0.005) debtors.push({ name, amount: -bal });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transfers: SettlementTransfer[] = [];
  let di = 0;
  let ci = 0;

  while (di < debtors.length && ci < creditors.length) {
    const pay = Math.min(debtors[di].amount, creditors[ci].amount);
    if (pay >= 0.01) {
      transfers.push({
        from: debtors[di].name,
        to: creditors[ci].name,
        amount: Math.round(pay * 100) / 100,
      });
    }
    debtors[di].amount -= pay;
    creditors[ci].amount -= pay;
    if (debtors[di].amount < 0.01) di += 1;
    if (creditors[ci].amount < 0.01) ci += 1;
  }

  return transfers;
}
