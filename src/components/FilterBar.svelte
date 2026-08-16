<script lang="ts">
  import { Label, Input, Button } from 'flowbite-svelte';
  import AppDatepicker from './AppDatepicker.svelte';
  import { _ } from 'svelte-i18n';

  interface Filters {
    startDate: string;
    endDate: string;
    search: string;
  }

  const { onfilter, onreset }: {
    onfilter: (filters: Filters) => void;
    onreset: () => void;
  } = $props();

  let startDate = $state<Date | undefined>(undefined);
  let endDate   = $state<Date | undefined>(undefined);
  let search    = $state('');

  let errors = $state<{ startDate?: string; endDate?: string }>({});

  function toLocalISO(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
           `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  function validate(): boolean {
    const e: { startDate?: string; endDate?: string } = {};
    if (startDate && endDate && endDate < startDate) {
      e.endDate = $_('filter.errorEndBeforeStart');
    }
    if (endDate && !startDate) {
      e.startDate = $_('filter.errorStartRequired');
    }
    errors = e;
    return Object.keys(e).length === 0;
  }

  function handleApply() {
    if (!validate()) return;
    onfilter({
      startDate: startDate ? toLocalISO(startDate) : '',
      endDate:   endDate   ? toLocalISO(endDate)   : '',
      search,
    });
  }

  function handleReset() {
    startDate = undefined;
    endDate   = undefined;
    search    = '';
    errors    = {};
    onreset();
  }

  const hasActiveFilter = $derived(!!startDate || !!endDate || !!search);
</script>

<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 p-5 mb-6">
  <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
    </svg>
    {$_('filter.title')}
    {#if hasActiveFilter}
      <span class="ml-auto inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
        {$_('filter.active')}
      </span>
    {/if}
  </h2>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <AppDatepicker
        id="filter-start"
        label={$_('filter.from')}
        bind:value={startDate}
        maxDate={endDate}
        showTime
      />
      {#if errors.startDate}
        <p class="mt-1 text-xs text-red-500">{errors.startDate}</p>
      {/if}
    </div>

    <div>
      <AppDatepicker
        id="filter-end"
        label={$_('filter.to')}
        bind:value={endDate}
        minDate={startDate}
        showTime
      />
      {#if errors.endDate}
        <p class="mt-1 text-xs text-red-500">{errors.endDate}</p>
      {/if}
    </div>

    <div class="sm:col-span-2">
      <Label for="filter-search" class="mb-1 block text-xs font-medium">{$_('filter.search')}</Label>
      <Input
        id="filter-search"
        type="text"
        bind:value={search}
        placeholder={$_('transactions.placeholderSearch')}
        size="sm"
      />
    </div>
  </div>

  <div class="mt-4 flex justify-end gap-2">
    {#if hasActiveFilter}
      <Button size="xs" color="light" onclick={handleReset}>
        {$_('filter.clear')}
      </Button>
    {/if}
    <Button size="xs" color="blue" onclick={handleApply}>
      {$_('filter.apply')}
    </Button>
  </div>
</div>
