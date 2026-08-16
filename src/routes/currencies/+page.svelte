<script lang="ts">
  import MaintenanceTable from '../../components/MaintenanceTable.svelte';
  import { _ } from 'svelte-i18n';

  const columns = $derived([
    { key: 'code',   label: $_('currencies.colCode'),   placeholder: 'USD',             editable: true },
    { key: 'symbol', label: $_('currencies.colSymbol'), placeholder: '$',               editable: true },
    { key: 'name',   label: $_('currencies.colName'),   placeholder: 'US Dollar',       editable: true },
    { key: 'active', label: $_('currencies.colStatus'), type: 'toggle' as const,        editable: true },
  ]);
</script>

<svelte:head><title>{$_('currencies.title')} · Hello Expenses</title></svelte:head>

<div class="py-8 px-4">
  <div class="mx-auto max-w-3xl">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-white">{$_('currencies.title')}</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{$_('currencies.subtitle')}</p>
    </div>
    <MaintenanceTable
      title={$_('currencies.tableTitle')}
      apiPath="/currency"
      {columns}
      addLabel={$_('currencies.addLabel')}
    />
  </div>
</div>
