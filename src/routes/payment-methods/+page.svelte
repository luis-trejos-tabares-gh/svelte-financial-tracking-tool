<script lang="ts">
  import MaintenanceTable from '../../components/MaintenanceTable.svelte';
  import { _ } from 'svelte-i18n';

  const columns = $derived([
    { key: 'icon',   label: $_('paymentMethodsPage.colIcon'),   placeholder: '💳',               editable: true },
    { key: 'code',   label: $_('paymentMethodsPage.colCode'),   placeholder: 'credit_card',      editable: true },
    { key: 'name',   label: $_('paymentMethodsPage.colName'),   placeholder: 'Credit Card',      editable: true },
    { key: 'active', label: $_('paymentMethodsPage.colStatus'), type: 'toggle' as const,         editable: true },
  ]);
</script>

<svelte:head><title>{$_('paymentMethodsPage.title')} · {$_('common.appName')}</title></svelte:head>

<div class="py-8 px-4">
  <div class="mx-auto max-w-3xl">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-white">{$_('paymentMethodsPage.title')}</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{$_('paymentMethodsPage.subtitle')}</p>
    </div>
    <MaintenanceTable
      title={$_('paymentMethodsPage.tableTitle')}
      apiPath="/payment-method"
      {columns}
      addLabel={$_('paymentMethodsPage.addLabel')}
    />
  </div>
</div>
