<script lang="ts">
  import MaintenanceTable from '../../components/MaintenanceTable.svelte';

  const columns = [
    { key: 'code',   label: 'Código',  placeholder: 'USD',              editable: true  },
    { key: 'symbol', label: 'Símbolo', placeholder: '$',                editable: true  },
    { key: 'name',   label: 'Nombre',  placeholder: 'Dólar Americano',  editable: true  },
    { key: 'active', label: 'Estado',  type: 'toggle' as const,                  editable: true  },
  ];
</script>

<svelte:head><title>Monedas · Hello Expenses</title></svelte:head>

<div class="py-8 px-4">
  <div class="mx-auto max-w-3xl">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Monedas</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
        Administra las monedas disponibles para registrar transacciones.
      </p>
    </div>
    <MaintenanceTable
      title="Monedas registradas"
      apiPath="/currency"
      {columns}
      addLabel="Agregar moneda"
    />
  </div>
</div>
