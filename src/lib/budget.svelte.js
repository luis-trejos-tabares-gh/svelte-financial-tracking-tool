/**
 * Budget store.
 * Fetches all budgets from /budget and exposes those whose date range overlaps
 * the currently selected month. Call budget.loadForMonth(year, month) to change
 * the active month, or budget.load() to refresh data without changing the month.
 */
function createBudgetStore() {
  /** @type {{ id:string, label:string, amount:number, spent:number, currency:string, startDate:string, endDate:string, active:boolean }[]} */
  let all     = $state([]);
  let loading = $state(false);

  const now = new Date();
  let _year  = $state(now.getFullYear());
  let _month = $state(now.getMonth() + 1); // 1-indexed

  /** Budgets that overlap the selected month and are marked active */
  const open = $derived.by(() => {
    const pad    = (n) => String(n).padStart(2, '0');
    const mStart = `${_year}-${pad(_month)}-01`;
    const lastDay = new Date(_year, _month, 0).getDate();
    const mEnd   = `${_year}-${pad(_month)}-${pad(lastDay)}`;
    return all.filter(b => b.active && b.startDate <= mEnd && b.endDate >= mStart);
  });

  async function load() {
    if (typeof fetch === 'undefined') return;
    loading = true;
    try {
      const res = await fetch('/budget');
      if (res.ok) all = await res.json();
    } catch { /* silently ignore network errors */ }
    finally { loading = false; }
  }

  function loadForMonth(year, month) {
    _year  = year;
    _month = month;
    load();
  }

  return {
    get open()    { return open;    },
    get loading() { return loading; },
    load,
    loadForMonth,
  };
}

export const budget = createBudgetStore();
