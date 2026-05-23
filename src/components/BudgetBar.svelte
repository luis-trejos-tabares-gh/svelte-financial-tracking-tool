<script>
  import { budget, BUDGET } from '$lib/budget.svelte.js';

  const fmt = (n) => '₡' + Math.abs(n).toLocaleString('es-CR');

  const barColor = $derived(
    budget.isOverBudget   ? 'bg-red-500' :
    budget.percent >= 80  ? 'bg-amber-400' :
    budget.percent >= 50  ? 'bg-yellow-300' :
                            'bg-emerald-400'
  );

  const remainingColor = $derived(
    budget.isOverBudget  ? 'text-red-500 dark:text-red-400 font-semibold' :
    budget.percent >= 80 ? 'text-amber-500 dark:text-amber-400' :
                           'text-emerald-600 dark:text-emerald-400'
  );
</script>

<div class="w-full border-b border-slate-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-4 py-2.5">
  <div class="mx-auto max-w-screen-sm flex items-center gap-3 text-xs">

    <!-- Left: budget total -->
    <span class="shrink-0 text-slate-500 dark:text-slate-400">
      Presupuesto: <span class="font-semibold text-slate-700 dark:text-slate-200">{fmt(BUDGET)}</span>
    </span>

    <!-- Progress bar -->
    <div class="flex-1 h-2 rounded-full bg-slate-200 dark:bg-gray-700 overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-500 {barColor}"
        style="width: {budget.percent}%"
      ></div>
    </div>

    <!-- Right: spent · remaining -->
    <span class="shrink-0 text-slate-400 dark:text-slate-500">
      {fmt(budget.totalSpent)} gastado
      &nbsp;·&nbsp;
      <span class={remainingColor}>
        {#if budget.isOverBudget}
          {fmt(Math.abs(budget.remaining))} sobre límite
        {:else}
          {fmt(budget.remaining)} disponible
        {/if}
      </span>
    </span>

  </div>
</div>
