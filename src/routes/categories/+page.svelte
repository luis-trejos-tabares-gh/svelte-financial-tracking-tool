<script lang="ts">
  import MaintenanceTable from '../../components/MaintenanceTable.svelte';

  const columns = [
    { key: 'name',   label: 'Nombre',  placeholder: 'Hogar',   editable: true             },
    { key: 'active', label: 'Estado',  type: 'toggle' as const, editable: true            },
  ];
</script>

<svelte:head><title>Categorías · Hello Expenses</title></svelte:head>

<div class="py-8 px-4">
  <div class="mx-auto max-w-3xl">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Categorías</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
        Administra las categorías disponibles para clasificar tus gastos.
      </p>
    </div>
    <MaintenanceTable
      title="Categorías registradas"
      apiPath="/category"
      {columns}
      addLabel="Agregar categoría"
    />
  </div>
</div>
