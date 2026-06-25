<script lang="ts">
  import MaintenanceTable from '../../components/MaintenanceTable.svelte';

  const columns = [
    { key: 'icon',   label: 'Ícono',            placeholder: '💳',                      editable: true  },
    { key: 'code',   label: 'Código',            placeholder: 'tarjeta_credito',         editable: true  },
    { key: 'name',   label: 'Nombre',            placeholder: 'Tarjeta de Crédito',      editable: true  },
    { key: 'active', label: 'Estado',            type: 'toggle' as const,               editable: true  },
  ];
</script>

<svelte:head><title>Métodos de Pago · Hello Expenses</title></svelte:head>

<div class="py-8 px-4">
  <div class="mx-auto max-w-3xl">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Métodos de Pago</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
        Administra los métodos de pago disponibles al registrar una transacción.
      </p>
    </div>
    <MaintenanceTable
      title="Métodos registrados"
      apiPath="/payment-method"
      {columns}
      addLabel="Agregar método"
    />
  </div>
</div>
