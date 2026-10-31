export type CostLine = { quantity: number; rateMinor: number };
export function budgetTotal(
  lines: CostLine[],
  contingencyPercent = 0,
  taxPercent = 0,
) {
  const subtotal = lines.reduce(
    (sum, line) => sum + Math.round(line.quantity * line.rateMinor),
    0,
  );
  const contingency = Math.round((subtotal * contingencyPercent) / 100);
  const tax = Math.round(((subtotal + contingency) * taxPercent) / 100);
  const total = subtotal + contingency + tax;
  if (![subtotal, contingency, tax, total].every(Number.isSafeInteger))
    throw new Error("Budget exceeds supported amount");
  return { subtotal, contingency, tax, total };
}
export function financials(
  lines: CostLine[],
  expenses: { amountMinor: number }[],
  contingency = 0,
  tax = 0,
) {
  const budget = budgetTotal(lines, contingency, tax);
  const spent = expenses.reduce((sum, e) => sum + e.amountMinor, 0);
  if (!Number.isSafeInteger(spent))
    throw new Error("Expenses exceed supported amount");
  return {
    ...budget,
    spent,
    remaining: budget.total - spent,
    variance: budget.total - spent,
    utilisation: budget.total ? (spent / budget.total) * 100 : null,
  };
}
