<script lang="ts">
  import { Button, Label, Input, Select } from "flowbite-svelte";
  import CustomTable from '../components/CustomTable.svelte';
  import Snackbar from '../components/Snackbar.svelte';
  import FilterBar from '../components/FilterBar.svelte';
  import AppDatepicker from '../components/AppDatepicker.svelte';
  import BudgetBar from '../components/BudgetBar.svelte';
  import { budget } from '$lib/budget.svelte.js';

  let { data } = $props();

  // ── Form state ────────────────────────────────────────────────
  let title         = $state<string | undefined>(undefined);
  let amount        = $state<number | undefined>(undefined);
  let selectedDate  = $state<Date | undefined>(undefined);
  let category      = $state<string | undefined>(undefined);
  let currency      = $state<string>('CRC');
  let paymentMethod = $state<string>('');

  // Seed payment method default once options load
  $effect(() => {
    if (!paymentMethod && data.paymentMethods?.length) {
      paymentMethod = data.paymentMethods[0].code;
    }
  });

  // Seed category default once options load
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

  // ── Filter state ──────────────────────────────────────────────
  let filteredTransactions = $state<any[]>([]);
  let isFiltering = $state(false);

  // Seed filtered list whenever server data changes (e.g. after SSR or navigation)
  $effect(() => {
    filteredTransactions = data.transactions ?? [];
  });

  async function fetchTransactions(params: Record<string, string> = {}) {
    isFiltering = true;
    try {
      const qs = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v))
      ).toString();
      const res = await fetch(`/transaction${qs ? `?${qs}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch');
      filteredTransactions = await res.json();
    } catch (e) {
      showSnackbar('Error al cargar las transacciones.', 'error');
    } finally {
      isFiltering = false;
    }
  }

  function handleFilter({ startDate, endDate, search }: { startDate: string; endDate: string; search: string }) {
    fetchTransactions({ startDate, endDate, search });
  }

  function handleFilterReset() {
    filteredTransactions = data.transactions ?? [];
  }

  // ── Delete ────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    await fetch(`/transaction/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }).then((response) => {
      if (!response.ok) throw new Error("Failed to delete transaction");
      // Remove from both master list and filtered view
      data = { ...data, transactions: (data.transactions ?? []).filter((t: any) => t.id !== id) };
      filteredTransactions = filteredTransactions.filter((t: any) => t.id !== id);
      showSnackbar('Transacción eliminada.', 'success');
      budget.load();
    }).catch((error) => {
      console.error("Error deleting transaction:", error);
      showSnackbar('Error al eliminar la transacción.', 'error');
    });
  }

  // ── Helpers ───────────────────────────────────────────────────
  /** Returns an ISO-8601 string in local time (YYYY-MM-DDTHH:mm:ss) to avoid UTC date shifting. */
  function toLocalISOString(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
           `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  // ── Save ──────────────────────────────────────────────────────
  async function handleSave() {
    await fetch("/transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, amount, category, currency, paymentMethod,
        date: selectedDate ? toLocalISOString(selectedDate) : undefined,
      }),
    }).then((response) => {
      if (!response.ok) throw new Error("Failed to save transaction");
      return response.json();
    }).then((response) => {
      const newTx = response.data;
      data = { ...data, transactions: [...(data.transactions ?? []), newTx] };
      filteredTransactions = [...filteredTransactions, newTx];
      title = "";
      amount = undefined;
      selectedDate = undefined;
      category = undefined;
      currency = 'CRC';
      paymentMethod = data.paymentMethods?.[0]?.code ?? '';
      category = data.categories?.[0]?.name ?? undefined;
      showSnackbar('¡Transacción guardada!', 'success');
      budget.load();
    }).catch((error) => {
      console.error("Error saving transaction:", error);
      showSnackbar('Error al guardar la transacción.', 'error');
    });
  }
</script>

<Snackbar bind:visible={snackbarVisible} message={snackbarMessage} type={snackbarType} />

<div class="bg-linear-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 py-10 px-4 min-h-full transition-colors duration-300">
  <div class="mx-auto">

    <BudgetBar />

    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-8 border border-slate-200 dark:border-gray-700">
      <h2 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-5">Nueva Transacción</h2>

      <div class="mb-4">
        <Label for="title-input" class="mb-1 block text-sm font-medium">Título</Label>
        <Input id="title-input" bind:value={title} size="md" placeholder="ej. Supermercado" />
      </div>
      <div class="mb-4">
        <AppDatepicker id="date-picker" label="Fecha" bind:value={selectedDate} />
      </div>

      <!-- Monto + moneda en la misma fila -->
      <div class="mb-4 grid grid-cols-3 gap-3 items-end">
        <div class="col-span-2">
          <Label for="amount-input" class="mb-1 block text-sm font-medium">Monto</Label>
          <Input id="amount-input" type="number" bind:value={amount} size="md" placeholder="0.00" />
        </div>
        <div>
          <Label for="currency-select" class="mb-1 block text-sm font-medium">Moneda</Label>
          <Select
            id="currency-select"
            bind:value={currency}
            size="md"
            items={data.currencies?.map((c: any) => ({ value: c.code, name: `${c.symbol} ${c.code}` })) ?? []}
          />
        </div>
      </div>

      <div class="mb-4">
        <Label for="category-select" class="mb-1 block text-sm font-medium">Categoría</Label>
        <Select
          id="category-select"
          bind:value={category}
          size="md"
          items={data.categories?.map((c: any) => ({ value: c.name, name: c.name })) ?? []}
        />
      </div>

      <div class="mb-6">
        <Label for="payment-select" class="mb-1 block text-sm font-medium">Método de Pago</Label>
        <Select
          id="payment-select"
          bind:value={paymentMethod}
          size="md"
          items={data.paymentMethods?.map((p: any) => ({ value: p.code, name: `${p.icon ?? ''} ${p.name}`.trim() })) ?? []}
        />
      </div>

      <div class="flex justify-end">
        <Button color="green" onclick={handleSave}
          disabled={!title || !amount || !selectedDate || !category || !currency || !paymentMethod}
          class="px-6 rounded-lg font-semibold text-sm shadow-sm">
          Guardar
        </Button>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-slate-200 dark:border-gray-700">
      <h2 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Historial de Transacciones</h2>
      <FilterBar onfilter={handleFilter} onreset={handleFilterReset} />
      {#if isFiltering}
        <div class="flex items-center justify-center py-10 text-slate-400 dark:text-slate-500 gap-2 text-sm">
          <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          Filtrando...
        </div>
      {:else}
        <CustomTable data={filteredTransactions} ondelete={handleDelete} />
      {/if}
    </div>

  </div>
</div>