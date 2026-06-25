<script lang="ts">
  import { Button, Input, Label, Select, Toggle } from 'flowbite-svelte';
  import Snackbar from '../../components/Snackbar.svelte';

  // ── Types ─────────────────────────────────────────────────────
  interface Budget {
    id: string;
    type: 'monthly' | 'ranged';
    label: string;
    amount: number;
    currency: string;
    startDate: string;
    endDate: string;
    active: boolean;
    spent: number;
  }

  // ── State ─────────────────────────────────────────────────────
  let tab        = $state<'monthly' | 'ranged'>('monthly');
  let budgets    = $state<Budget[]>([]);
  let loading    = $state(true);
  let submitting = $state(false);

  // Monthly form
  const now = new Date();
  let mYear     = $state(now.getFullYear());
  let mMonth    = $state(now.getMonth() + 1);   // 1-indexed
  let mAmount   = $state<number | undefined>(undefined);
  let mCurrency = $state('CRC');
  let mLabel    = $state('');

  // Ranged form
  let rLabel     = $state('');
  let rAmount    = $state<number | undefined>(undefined);
  let rCurrency  = $state('CRC');
  let rStartDate = $state('');
  let rEndDate   = $state('');

  // Range validation errors
  let rErrors = $state<{ startDate?: string; endDate?: string; overlap?: string }>({});

  // Edit state
  let editId     = $state<string | null>(null);
  let editValues = $state<Partial<Budget>>({});

  // Snackbar
  let snackbarVisible = $state(false);
  let snackbarMessage = $state('');
  let snackbarType    = $state<'success' | 'error' | 'info'>('info');

  function toast(msg: string, type: 'success' | 'error' | 'info' = 'info') {
    snackbarMessage = msg; snackbarType = type;
    snackbarVisible = true;
    setTimeout(() => (snackbarVisible = false), 4000);
  }

  // ── Helpers ───────────────────────────────────────────────────
  const CURRENCIES = ['CRC', 'USD'];

  const MONTHS = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    name: new Date(2000, i, 1).toLocaleDateString('es-CR', { month: 'long' }),
  }));

  const YEARS = Array.from({ length: 5 }, (_, i) => ({
    value: now.getFullYear() - 2 + i,
    name: String(now.getFullYear() - 2 + i),
  }));

  function monthBounds(year: number, month: number) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end   = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { start, end };
  }

  function fmt(amount: number, currency: string) {
    if (currency === 'USD') return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    return `₡${amount.toLocaleString('es-CR')}`;
  }

  function percent(spent: number, amount: number) {
    return Math.min((spent / amount) * 100, 100);
  }

  function barColor(pct: number) {
    if (pct >= 100) return 'bg-red-500';
    if (pct >= 80)  return 'bg-amber-400';
    if (pct >= 50)  return 'bg-yellow-300';
    return 'bg-emerald-400';
  }

  function statusText(spent: number, amount: number, currency: string) {
    const remaining = amount - spent;
    if (remaining < 0) return `${fmt(Math.abs(remaining), currency)} sobre el límite`;
    return `${fmt(remaining, currency)} disponible`;
  }

  function statusColor(spent: number, amount: number) {
    const pct = (spent / amount) * 100;
    if (pct >= 100) return 'text-red-500 dark:text-red-400';
    if (pct >= 80)  return 'text-amber-500 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
  }

  // ── Load ──────────────────────────────────────────────────────
  async function load() {
    loading = true;
    try {
      const res = await fetch('/budget');
      budgets = await res.json();
    } catch { toast('Error al cargar presupuestos.', 'error'); }
    finally { loading = false; }
  }

  $effect(() => { load(); });

  // ── Monthly: auto-fill label ──────────────────────────────────
  $effect(() => {
    const monthName = new Date(mYear, mMonth - 1, 1)
      .toLocaleDateString('es-CR', { month: 'long', year: 'numeric' });
    mLabel = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  });

  // ── Range validation ──────────────────────────────────────────
  $effect(() => {
    const e: typeof rErrors = {};
    if (rEndDate && rStartDate && rEndDate < rStartDate) {
      e.endDate = 'La fecha de fin no puede ser anterior a la de inicio.';
    }
    if (rEndDate && !rStartDate) e.startDate = 'Ingresa una fecha de inicio.';
    rErrors = e;
  });

  // ── Submit monthly ────────────────────────────────────────────
  async function handleMonthly() {
    const { start, end } = monthBounds(mYear, mMonth);
    submitting = true;
    const res = await fetch('/budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'monthly', label: mLabel,
        amount: mAmount, currency: mCurrency,
        startDate: start, endDate: end,
      }),
    });
    submitting = false;
    const body = await res.json();
    if (!res.ok) { toast(body.message, 'error'); return; }
    budgets = [...budgets, body];
    mAmount = undefined;
    toast('Presupuesto mensual creado.', 'success');
  }

  // ── Submit ranged ─────────────────────────────────────────────
  async function handleRanged() {
    if (Object.keys(rErrors).length) return;
    submitting = true;
    const res = await fetch('/budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'ranged', label: rLabel,
        amount: rAmount, currency: rCurrency,
        startDate: rStartDate, endDate: rEndDate,
      }),
    });
    submitting = false;
    const body = await res.json();
    if (!res.ok) { rErrors = { overlap: body.message }; return; }
    budgets = [...budgets, body];
    rLabel = ''; rAmount = undefined; rStartDate = ''; rEndDate = '';
    rErrors = {};
    toast('Presupuesto por rango creado.', 'success');
  }

  // ── Edit ──────────────────────────────────────────────────────
  function startEdit(b: Budget) {
    editId = b.id;
    editValues = { label: b.label, amount: b.amount, active: b.active };
  }

  async function saveEdit() {
    const res = await fetch(`/budget/${editId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editValues),
    });
    const body = await res.json();
    if (!res.ok) { toast(body.message, 'error'); return; }
    budgets = budgets.map(b => b.id === editId ? { ...b, ...body } : b);
    editId = null;
    toast('Presupuesto actualizado.', 'success');
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este presupuesto?')) return;
    await fetch(`/budget/${id}`, { method: 'DELETE' });
    budgets = budgets.filter(b => b.id !== id);
    toast('Presupuesto eliminado.', 'success');
  }

  // Filtered lists for display
  const monthlyBudgets = $derived(budgets.filter(b => b.type === 'monthly'));
  const rangedBudgets  = $derived(budgets.filter(b => b.type === 'ranged'));
</script>

<svelte:head><title>Presupuestos · Hello Expenses</title></svelte:head>

<Snackbar bind:visible={snackbarVisible} message={snackbarMessage} type={snackbarType} />

<div class="py-8 px-4">
  <div class="mx-auto max-w-3xl">

    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Presupuestos</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
        Define límites de gasto mensuales o por rango de fechas.
      </p>
    </div>

    <!-- ── Tab selector ───────────────────────────────────────── -->
    <div class="flex gap-1 p-1 bg-slate-100 dark:bg-gray-800 rounded-xl mb-6 border border-slate-200 dark:border-gray-700">
      {#each [{ value: 'monthly', label: '📅 Mensual' }, { value: 'ranged', label: '📆 Por Rango' }] as t}
        <button
          type="button"
          onclick={() => tab = t.value as 'monthly' | 'ranged'}
          class="flex-1 py-2 rounded-lg text-sm font-medium transition-all
            {tab === t.value
              ? 'bg-white dark:bg-gray-900 text-slate-800 dark:text-white shadow'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}"
        >{t.label}</button>
      {/each}
    </div>

    <!-- ── Monthly form ───────────────────────────────────────── -->
    {#if tab === 'monthly'}
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 p-6 mb-6">
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Nuevo presupuesto mensual</h2>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label class="mb-1 block text-xs font-medium">Mes</Label>
            <Select
              bind:value={mMonth}
              items={MONTHS.map(m => ({ value: m.value, name: m.name }))}
              size="sm"
            />
          </div>
          <div>
            <Label class="mb-1 block text-xs font-medium">Año</Label>
            <Select
              bind:value={mYear}
              items={YEARS.map(y => ({ value: y.value, name: y.name }))}
              size="sm"
            />
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="col-span-2">
            <Label class="mb-1 block text-xs font-medium">Monto límite</Label>
            <Input type="number" bind:value={mAmount} placeholder="500000" size="sm" />
          </div>
          <div>
            <Label class="mb-1 block text-xs font-medium">Moneda</Label>
            <Select
              bind:value={mCurrency}
              items={CURRENCIES.map(c => ({ value: c, name: c }))}
              size="sm"
            />
          </div>
        </div>
        <div class="mb-4">
          <Label class="mb-1 block text-xs font-medium">Etiqueta</Label>
          <Input type="text" bind:value={mLabel} placeholder="ej. Junio 2026" size="sm" />
        </div>
        <div class="flex justify-end">
          <Button size="sm" color="green" onclick={handleMonthly}
            disabled={!mAmount || !mLabel || submitting}>
            {submitting ? 'Guardando…' : 'Crear presupuesto'}
          </Button>
        </div>
      </div>

    <!-- ── Ranged form ─────────────────────────────────────────── -->
    {:else}
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 p-6 mb-6">
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Nuevo presupuesto por rango</h2>
        <div class="mb-4">
          <Label class="mb-1 block text-xs font-medium">Etiqueta</Label>
          <Input type="text" bind:value={rLabel} placeholder="ej. Viaje a Panamá" size="sm" />
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label class="mb-1 block text-xs font-medium">Fecha inicio</Label>
            <Input type="date" bind:value={rStartDate} max={rEndDate || undefined} size="sm" />
            {#if rErrors.startDate}
              <p class="mt-1 text-xs text-red-500">{rErrors.startDate}</p>
            {/if}
          </div>
          <div>
            <Label class="mb-1 block text-xs font-medium">Fecha fin</Label>
            <Input type="date" bind:value={rEndDate} min={rStartDate || undefined} size="sm" />
            {#if rErrors.endDate}
              <p class="mt-1 text-xs text-red-500">{rErrors.endDate}</p>
            {/if}
          </div>
        </div>
        {#if rErrors.overlap}
          <div class="mb-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 px-4 py-2.5 text-sm text-red-600 dark:text-red-400">
            ⚠️ {rErrors.overlap}
          </div>
        {/if}
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="col-span-2">
            <Label class="mb-1 block text-xs font-medium">Monto límite</Label>
            <Input type="number" bind:value={rAmount} placeholder="200000" size="sm" />
          </div>
          <div>
            <Label class="mb-1 block text-xs font-medium">Moneda</Label>
            <Select
              bind:value={rCurrency}
              items={CURRENCIES.map(c => ({ value: c, name: c }))}
              size="sm"
            />
          </div>
        </div>
        <div class="flex justify-end">
          <Button size="sm" color="green" onclick={handleRanged}
            disabled={!rLabel || !rAmount || !rStartDate || !rEndDate || Object.keys(rErrors).length > 0 || submitting}>
            {submitting ? 'Guardando…' : 'Crear presupuesto'}
          </Button>
        </div>
      </div>
    {/if}

    <!-- ── Budget list ─────────────────────────────────────────── -->
    {#if loading}
      <div class="text-center py-12 text-slate-400 text-sm">Cargando presupuestos…</div>
    {:else if budgets.length === 0}
      <div class="text-center py-12 text-slate-400 dark:text-slate-500 italic text-sm">
        No hay presupuestos registrados aún.
      </div>
    {:else}
      <!-- Monthly section -->
      {#if monthlyBudgets.length > 0}
        <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-3">
          Mensuales
        </h3>
        <div class="space-y-3 mb-6">
          {#each monthlyBudgets as b}
            {@const pct = percent(b.spent, b.amount)}
            <div class="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-5
                        {!b.active ? 'opacity-50' : ''}">
              {#if editId === b.id}
                <!-- Inline edit -->
                <div class="flex flex-wrap gap-3 items-end">
                  <div class="flex-1 min-w-32">
                    <Label class="mb-1 text-xs font-medium">Etiqueta</Label>
                    <Input size="sm" bind:value={editValues.label} />
                  </div>
                  <div class="w-36">
                    <Label class="mb-1 text-xs font-medium">Monto límite</Label>
                    <Input size="sm" type="number" bind:value={editValues.amount} />
                  </div>
                  <div class="flex items-center gap-2">
                    <Toggle bind:checked={editValues.active} />
                    <span class="text-xs text-slate-500">{editValues.active ? 'Activo' : 'Inactivo'}</span>
                  </div>
                  <Button size="xs" color="green" onclick={saveEdit}>Guardar</Button>
                  <Button size="xs" color="light" onclick={() => editId = null}>Cancelar</Button>
                </div>
              {:else}
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <p class="font-semibold text-slate-800 dark:text-white text-sm">{b.label}</p>
                    <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {b.startDate} → {b.endDate}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">{fmt(b.amount, b.currency)}</p>
                    <p class="text-xs {statusColor(b.spent, b.amount)} mt-0.5">{statusText(b.spent, b.amount, b.currency)}</p>
                  </div>
                </div>
                <!-- Progress bar -->
                <div class="h-2 w-full rounded-full bg-slate-100 dark:bg-gray-700 overflow-hidden mb-3">
                  <div class="h-full rounded-full transition-all duration-500 {barColor(pct)}" style="width:{pct}%"></div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-slate-400">{fmt(b.spent, b.currency)} gastado de {fmt(b.amount, b.currency)}</span>
                  <div class="flex gap-2">
                    <Button size="xs" color="blue" outline onclick={() => startEdit(b)}>Editar</Button>
                    <Button size="xs" color="red" outline onclick={() => handleDelete(b.id)}>Eliminar</Button>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}

      <!-- Ranged section -->
      {#if rangedBudgets.length > 0}
        <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-3">
          Por rango
        </h3>
        <div class="space-y-3">
          {#each rangedBudgets as b}
            {@const pct = percent(b.spent, b.amount)}
            <div class="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-5
                        {!b.active ? 'opacity-50' : ''}">
              {#if editId === b.id}
                <div class="flex flex-wrap gap-3 items-end">
                  <div class="flex-1 min-w-32">
                    <Label class="mb-1 text-xs font-medium">Etiqueta</Label>
                    <Input size="sm" bind:value={editValues.label} />
                  </div>
                  <div class="w-36">
                    <Label class="mb-1 text-xs font-medium">Monto límite</Label>
                    <Input size="sm" type="number" bind:value={editValues.amount} />
                  </div>
                  <div class="flex items-center gap-2">
                    <Toggle bind:checked={editValues.active} />
                    <span class="text-xs text-slate-500">{editValues.active ? 'Activo' : 'Inactivo'}</span>
                  </div>
                  <Button size="xs" color="green" onclick={saveEdit}>Guardar</Button>
                  <Button size="xs" color="light" onclick={() => editId = null}>Cancelar</Button>
                </div>
              {:else}
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <p class="font-semibold text-slate-800 dark:text-white text-sm">{b.label}</p>
                    <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {b.startDate} → {b.endDate}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">{fmt(b.amount, b.currency)}</p>
                    <p class="text-xs {statusColor(b.spent, b.amount)} mt-0.5">{statusText(b.spent, b.amount, b.currency)}</p>
                  </div>
                </div>
                <div class="h-2 w-full rounded-full bg-slate-100 dark:bg-gray-700 overflow-hidden mb-3">
                  <div class="h-full rounded-full transition-all duration-500 {barColor(pct)}" style="width:{pct}%"></div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-slate-400">{fmt(b.spent, b.currency)} gastado de {fmt(b.amount, b.currency)}</span>
                  <div class="flex gap-2">
                    <Button size="xs" color="blue" outline onclick={() => startEdit(b)}>Editar</Button>
                    <Button size="xs" color="red" outline onclick={() => handleDelete(b.id)}>Eliminar</Button>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    {/if}

  </div>
</div>
