<script>
  import { budget } from '$lib/budget.svelte.js';

  function fmt(amount, currency) {
    if (currency === 'USD') return `$${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    return `₡${Math.abs(amount).toLocaleString('es-CR')}`;
  }

  function pct(spent, amount) {
    return Math.min((spent / amount) * 100, 100);
  }

  function barColor(p) {
    if (p >= 100) return 'bg-red-500';
    if (p >= 80)  return 'bg-amber-400';
    if (p >= 50)  return 'bg-yellow-300';
    return 'bg-emerald-400';
  }

  function remainingColor(spent, amount) {
    const p = (spent / amount) * 100;
    if (p >= 100) return 'text-red-500 dark:text-red-400 font-semibold';
    if (p >= 80)  return 'text-amber-500 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
  }
</script>

<div class="w-full border-t border-slate-200 dark:border-gray-700 px-4 py-2 text-xs">
  {#if budget.loading}
    <div class="text-slate-400 dark:text-slate-500">Cargando presupuesto…</div>

  {:else if budget.open.length === 0}
    <div class="text-slate-400 dark:text-slate-500 italic">Sin presupuesto activo para hoy.</div>

  {:else}
    <div class="flex flex-col gap-1.5">
      {#each budget.open as b}
        {@const p = pct(b.spent, b.amount)}
        {@const remaining = b.amount - b.spent}
        <div class="flex items-center gap-3">
          <!-- Label -->
          <span class="shrink-0 w-28 truncate font-medium text-slate-600 dark:text-slate-300" title={b.label}>
            {b.label}
          </span>

          <!-- Bar -->
          <div class="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-gray-700 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500 {barColor(p)}"
              style="width:{p}%"
            ></div>
          </div>

          <!-- Spent / remaining -->
          <span class="shrink-0 text-slate-400 dark:text-slate-500 whitespace-nowrap">
            {fmt(b.spent, b.currency)} gastado
            &nbsp;·&nbsp;
            <span class={remainingColor(b.spent, b.amount)}>
              {#if remaining < 0}
                {fmt(Math.abs(remaining), b.currency)} sobre límite
              {:else}
                {fmt(remaining, b.currency)} disponible
              {/if}
            </span>
          </span>
        </div>
      {/each}
    </div>
  {/if}
</div>
