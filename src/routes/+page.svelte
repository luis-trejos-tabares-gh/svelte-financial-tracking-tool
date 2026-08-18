<script lang="ts">
  import { Button, Label, Input, Select } from "flowbite-svelte";
  import { ChevronLeftOutline, ChevronRightOutline } from 'flowbite-svelte-icons';
  import CustomTable from '../components/CustomTable.svelte';
  import Snackbar from '../components/Snackbar.svelte';
  import AppDatepicker from '../components/AppDatepicker.svelte';
  import BudgetBar from '../components/BudgetBar.svelte';
  import { budget } from '$lib/budget.svelte.js';
  import { _ } from 'svelte-i18n';
  import { locale } from 'svelte-i18n';
  import { fmtMonthLabel } from '$lib/i18n';

  let { data } = $props();

  // ── Month navigation ──────────────────────────────────────────
  const todayYear  = new Date().getFullYear();
  const todayMonth = new Date().getMonth() + 1;

  let selectedYear  = $state(todayYear);
  let selectedMonth = $state(todayMonth);

  const isCurrentMonth = $derived(
    selectedYear === todayYear && selectedMonth === todayMonth
  );

  // Re-compute month label when locale or month changes
  const monthLabel = $derived.by(() => {
    $locale; // subscribe to locale changes so label updates on language switch
    return fmtMonthLabel(selectedYear, selectedMonth);
  });

  function prevMonth() {
    if (selectedMonth === 1) { selectedYear -= 1; selectedMonth = 12; }
    else { selectedMonth -= 1; }
  }

  function nextMonth() {
    if (isCurrentMonth) return;
    if (selectedMonth === 12) { selectedYear += 1; selectedMonth = 1; }
    else { selectedMonth += 1; }
  }

  function monthBounds(year: number, month: number) {
    const pad     = (n: number) => String(n).padStart(2, '0');
    const start   = `${year}-${pad(month)}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end     = `${year}-${pad(month)}-${pad(lastDay)}`;
    return { start, end };
  }

  // ── Transaction data ──────────────────────────────────────────
  let monthTransactions = $state<any[]>(data.transactions ?? []);
  let loadingTx = $state(false);

  $effect(() => {
    const { start, end } = monthBounds(selectedYear, selectedMonth);
    budget.loadForMonth(selectedYear, selectedMonth);
    fetchMonthTransactions(start, end);
  });

  async function fetchMonthTransactions(startDate: string, endDate: string) {
    loadingTx = true;
    try {
      const res = await fetch(`/transaction?startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) throw new Error();
      monthTransactions = await res.json();
    } catch {
      showSnackbar($_('transactions.errorLoad'), 'error');
    } finally {
      loadingTx = false;
    }
  }

  // ── Search filter (client-side within loaded month) ───────────
  let searchQuery = $state('');

  const displayedTransactions = $derived(
    searchQuery.trim()
      ? monthTransactions.filter((t: any) =>
          t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category?.toLowerCase().includes(searchQuery.toLowerCase()))
      : monthTransactions
  );

  // ── Form state ────────────────────────────────────────────────
  let title         = $state<string | undefined>(undefined);
  let amount        = $state<number | undefined>(undefined);
  let selectedDate  = $state<Date | undefined>(undefined);
  let category      = $state<string | undefined>(undefined);
  let currency      = $state<string>('CRC');
  let paymentMethod = $state<string>('');
  let txType        = $state<'expense' | 'income'>('expense');
  let budgetId      = $state<string>('');

  const matchingBudgets = $derived(
    budget.open.filter((b: any) => b.currency === currency)
  );

  $effect(() => {
    if (!paymentMethod && data.paymentMethods?.length) {
      paymentMethod = data.paymentMethods[0].code;
    }
  });

  $effect(() => {
    if (!category && data.categories?.length) {
      category = data.categories[0].name;
    }
  });

  // ── Snackbar ──────────────────────────────────────────────────
  let snackbarVisible = $state(false);
  let snackbarMessage = $state('');
  let snackbarType = $state<'success' | 'error' | 'info'>('info');

  function showSnackbar(message: string, type: 'success' | 'error' | 'info' = 'info') {
    snackbarMessage = message;
    snackbarType = type;
    snackbarVisible = true;
    setTimeout(() => (snackbarVisible = false), 3500);
  }

  // ── Delete ────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/transaction/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error();
      monthTransactions = monthTransactions.filter((t: any) => t.id !== id);
      showSnackbar($_('transactions.deleted'), 'success');
      budget.load();
    } catch {
      showSnackbar($_('transactions.errorDelete'), 'error');
    }
  }

  function toLocalISOString(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
           `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  // ── Save ──────────────────────────────────────────────────────
  async function handleSave() {
    try {
      const res = await fetch('/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, amount, category, currency, paymentMethod,
          type: txType,
          budgetId: budgetId || null,
          date: selectedDate ? toLocalISOString(selectedDate) : undefined,
        }),
      });
      if (!res.ok) throw new Error();
      const { data: newTx } = await res.json();

      const txDateStr   = newTx.date?.slice(0, 7);
      const selMonthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
      if (txDateStr === selMonthStr) {
        monthTransactions = [...monthTransactions, newTx];
      }

      title = '';
      amount = undefined;
      selectedDate = undefined;
      txType = 'expense';
      budgetId = '';
      currency = 'CRC';
      paymentMethod = data.paymentMethods?.[0]?.code ?? '';
      category = data.categories?.[0]?.name ?? undefined;

      showSnackbar($_('transactions.saved'), 'success');
      budget.load();
    } catch {
      showSnackbar($_('transactions.errorSave'), 'error');
    }
  }
</script>

<svelte:head><title>{$_('transactions.title')} · {$_('common.appName')}</title></svelte:head>

<Snackbar bind:visible={snackbarVisible} message={snackbarMessage} type={snackbarType} />

<div class="bg-linear-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 py-10 px-4 min-h-full transition-colors duration-300">
  <div class="mx-auto">

    <!-- ── Month navigator ───────────────────────────────────────── -->
    <div class="flex items-center justify-between mb-3 px-1">
      <button
        type="button"
        onclick={prevMonth}
        class="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
        aria-label={$_('transactions.prevMonth')}
      >
        <ChevronLeftOutline class="w-5 h-5" />
      </button>

      <span class="text-base font-semibold text-slate-700 dark:text-slate-200 tracking-tight">
        {monthLabel}
      </span>

      <button
        type="button"
        onclick={nextMonth}
        disabled={isCurrentMonth}
        class="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 transition-colors
          {isCurrentMonth
            ? 'opacity-30 cursor-not-allowed'
            : 'hover:bg-slate-200 dark:hover:bg-gray-700'}"
        aria-label={$_('transactions.nextMonth')}
      >
        <ChevronRightOutline class="w-5 h-5" />
      </button>
    </div>

    <BudgetBar />

    <!-- ── New transaction form ──────────────────────────────────── -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-8 border border-slate-200 dark:border-gray-700">
      <h2 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-5">{$_('transactions.new')}</h2>

      <!-- Type toggle -->
      <div class="mb-4">
        <Label class="mb-1 block text-sm font-medium">{$_('transactions.type')}</Label>
        <div class="flex rounded-lg overflow-hidden border border-slate-200 dark:border-gray-600">
          <button
            type="button"
            onclick={() => txType = 'expense'}
            class="flex-1 py-2 text-sm font-medium transition-colors
              {txType === 'expense'
                ? 'bg-red-500 text-white'
                : 'bg-white dark:bg-gray-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-600'}"
          >
            {$_('transactions.typeExpense')}
          </button>
          <button
            type="button"
            onclick={() => txType = 'income'}
            class="flex-1 py-2 text-sm font-medium transition-colors border-l border-slate-200 dark:border-gray-600
              {txType === 'income'
                ? 'bg-emerald-500 text-white'
                : 'bg-white dark:bg-gray-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-600'}"
          >
            {$_('transactions.typeIncome')}
          </button>
        </div>
      </div>

      <div class="mb-4">
        <Label for="title-input" class="mb-1 block text-sm font-medium">{$_('transactions.titleField')}</Label>
        <Input id="title-input" bind:value={title} size="md" placeholder={$_('transactions.placeholderTitle')} />
      </div>

      <div class="mb-4">
        <AppDatepicker id="date-picker" label={$_('transactions.dateField')} bind:value={selectedDate} />
      </div>

      <div class="mb-4 grid grid-cols-3 gap-3 items-end">
        <div class="col-span-2">
          <Label for="amount-input" class="mb-1 block text-sm font-medium">{$_('transactions.amountField')}</Label>
          <Input id="amount-input" type="number" bind:value={amount} size="md" placeholder="0.00" />
        </div>
        <div>
          <Label for="currency-select" class="mb-1 block text-sm font-medium">{$_('transactions.currencyField')}</Label>
          <Select
            id="currency-select"
            bind:value={currency}
            size="md"
            items={data.currencies?.map((c: any) => ({ value: c.code, name: `${c.symbol} ${c.code}` })) ?? []}
          />
        </div>
      </div>

      <div class="mb-4">
        <Label for="category-select" class="mb-1 block text-sm font-medium">{$_('transactions.categoryField')}</Label>
        <Select
          id="category-select"
          bind:value={category}
          size="md"
          items={data.categories?.map((c: any) => ({ value: c.name, name: c.name })) ?? []}
        />
      </div>

      <div class="mb-4">
        <Label for="payment-select" class="mb-1 block text-sm font-medium">{$_('transactions.paymentMethodField')}</Label>
        <Select
          id="payment-select"
          bind:value={paymentMethod}
          size="md"
          items={data.paymentMethods?.map((p: any) => ({ value: p.code, name: `${p.icon ?? ''} ${p.name}`.trim() })) ?? []}
        />
      </div>

      <!-- Budget picker -->
      <div class="mb-6">
        <Label for="budget-select" class="mb-1 block text-sm font-medium">{$_('transactions.budgetField')}</Label>
        <Select
          id="budget-select"
          bind:value={budgetId}
          size="md"
          items={[
            { value: '', name: $_('transactions.noBudget') },
            ...matchingBudgets.map((b: any) => ({ value: b.id, name: b.label })),
          ]}
        />
        {#if matchingBudgets.length === 0}
          <p class="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {$_('transactions.noBudgetHint', { values: { month: monthLabel, currency } })}
          </p>
        {/if}
      </div>

      <div class="flex justify-end">
        <Button
          color="green"
          onclick={handleSave}
          disabled={!title || !amount || !selectedDate || !category || !currency || !paymentMethod}
          class="px-6 rounded-lg font-semibold text-sm shadow-sm"
        >
          {$_('common.save')}
        </Button>
      </div>
    </div>

    <!-- ── Transaction history ───────────────────────────────────── -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-slate-200 dark:border-gray-700">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-slate-700 dark:text-slate-200">{$_('transactions.history')}</h2>
        <span class="text-xs text-slate-400 dark:text-slate-500">{monthLabel}</span>
      </div>

      <div class="mb-4">
        <Input
          type="text"
          bind:value={searchQuery}
          placeholder={$_('transactions.placeholderSearch')}
          size="sm"
        />
      </div>

      {#if loadingTx}
        <div class="flex items-center justify-center py-10 text-slate-400 dark:text-slate-500 gap-2 text-sm">
          <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          {$_('common.loading')}
        </div>
      {:else}
        <CustomTable data={displayedTransactions} ondelete={handleDelete} />
      {/if}
    </div>

  </div>
</div>
