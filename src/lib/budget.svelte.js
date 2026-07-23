/**
 * Budget store.
 * Fetches all budgets from /budget and exposes only those active on today's date.
 * Call budget.load() to refresh (e.g. after a transaction is added/removed).
 */
function createBudgetStore() {
  /** @type {{ id:string, label:string, amount:number, spent:number, currency:string, startDate:string, endDate:string, active:boolean }[]} */
  let all     = $state([]);
  let loading = $state(false);

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  /** Budgets whose date range covers today and are marked active */
  const open = $derived(
    all.filter(b => b.active && b.startDate <= today && b.endDate >= today)
  );

  async function load() {
    if (typeof fetch === 'undefined') return;
    loading = true;
    try {
      const res = await fetch('/budget');
      if (res.ok) all = await res.json();
    } catch { /* silently ignore network errors */ }
    finally { loading = false; }
  }

  return {
    get open()    { return open;    },
    get loading() { return loading; },
    load,
  };
}

export const budget = createBudgetStore();
