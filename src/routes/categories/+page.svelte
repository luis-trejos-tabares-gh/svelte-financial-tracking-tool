<script lang="ts">
  import MaintenanceTable from '../../components/MaintenanceTable.svelte';
  import { _ } from 'svelte-i18n';

  const columns = $derived([
    { key: 'name',   label: $_('categories.colName'),   placeholder: $_('categories.placeholderName'), editable: true },
    { key: 'active', label: $_('categories.colStatus'), type: 'toggle' as const,                       editable: true },
  ]);
</script>

<svelte:head><title>{$_('categories.title')} · Hello Expenses</title></svelte:head>

<div class="py-8 px-4">
  <div class="mx-auto max-w-3xl">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-white">{$_('categories.title')}</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{$_('categories.subtitle')}</p>
    </div>
    <MaintenanceTable
      title={$_('categories.tableTitle')}
      apiPath="/category"
      {columns}
      addLabel={$_('categories.addLabel')}
    />
  </div>
</div>
