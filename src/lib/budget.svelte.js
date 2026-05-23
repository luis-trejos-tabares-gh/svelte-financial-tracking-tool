/** Hardcoded global budget in colones */
export const BUDGET = 500_000;

function createBudgetStore() {
  let totalSpent = $state(0);

  return {
    get totalSpent() { return totalSpent; },
    setSpent(v) { totalSpent = v; },
    get remaining() { return BUDGET - totalSpent; },
    get percent() { return Math.min((totalSpent / BUDGET) * 100, 100); },
    get isOverBudget() { return totalSpent > BUDGET; },
  };
}

export const budget = createBudgetStore();
