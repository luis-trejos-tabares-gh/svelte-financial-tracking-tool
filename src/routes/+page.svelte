<script lang="ts">
  import { Button, Datepicker, Label, Input, type DateOrRange } from "flowbite-svelte";
  import CustomTable from '../components/customTable.svelte';
  import Snackbar from '../components/Snackbar.svelte';

  let { data } = $props();

  let title = $state<string | undefined>(undefined);
  let amount = $state<number | undefined>(undefined);
  let selectedDate = $state<Date | undefined>(undefined);
  let lastAction = $state<string | undefined>(undefined);
  let category = $state<string | undefined>(undefined);

  let snackbarVisible = $state(false);
  let snackbarMessage = $state('');
  let snackbarType = $state<'success' | 'error' | 'info'>('info');

  function showSnackbar(message: string, type: 'success' | 'error' | 'info' = 'info') {
    snackbarMessage = message;
    snackbarType = type;
    snackbarVisible = true;
    setTimeout(() => (snackbarVisible = false), 3500);
  }

  function handleClear() {
    lastAction = "Cleared";
  }

  function handleApply(detail: DateOrRange): void {
    lastAction = "Applied";
    if (detail instanceof Date) {
      selectedDate = detail;
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/transaction/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }
      data = { ...data, transactions: (data.transactions ?? []).filter((t: any) => t.id !== id) };
      showSnackbar('Transacción eliminada.', 'success');
    }).catch((error) => {
      console.error("Error deleting transaction:", error);
      showSnackbar('Error al eliminar la transacción.', 'error');
    });
  }

  async function handleSave() {
    // Handle save action
    await fetch("/transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        amount,
        date: selectedDate?.toISOString(),
        category,
      }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error("Failed to save transaction");
      }
      return response.json();
    }).then((response) => {
      // Update the transactions list with the new transaction

      console.log(response.data);

      const transactions = [...(data.transactions ?? []), response.data];
      console.log(transactions);
      data = { ...data, transactions };
      title = "";
      amount = undefined;
      selectedDate = undefined;
      category = undefined;
      showSnackbar('¡Transacción guardada!', 'success');
    }).catch((error) => {
      console.error("Error saving transaction:", error);
      showSnackbar('Error al guardar la transacción.', 'error');
    });
  }
  
</script>

<Snackbar bind:visible={snackbarVisible} message={snackbarMessage} type={snackbarType} />

<div class="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 py-10 px-4">
  <div class="mx-auto max-w-screen-sm">

    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">💸 Hello Expenses</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Registra tus gastos fácilmente</p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-8 border border-slate-200 dark:border-gray-700">
      <h2 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-5">Nueva Transacción</h2>

      <div class="mb-4">
        <Label for="large-input" class="mb-1 block text-sm font-medium">Título</Label>
        <Input id="large-input" bind:value={title} size="md" placeholder="ej. Supermercado" />
      </div>
      <div class="mb-4">
        <Label for="date-picker" class="mb-1 block text-sm font-medium">Fecha</Label>
        <Datepicker id="date-picker" bind:value={selectedDate} showActionButtons autohide={false} onclear={handleClear} onapply={handleApply} />
      </div>
      <div class="mb-4">
        <Label for="amount-input" class="mb-1 block text-sm font-medium">Monto</Label>
        <Input id="amount-input" type="number" bind:value={amount} size="md" placeholder="0.00" />
      </div>
      <div class="mb-6">
        <Label for="category-input" class="mb-1 block text-sm font-medium">Categoría</Label>
        <Input id="category-input" type="text" bind:value={category} size="md" placeholder="ej. Comida, Transporte..." />
      </div>
      <div class="flex justify-end">
        <Button color="green" onclick={handleSave} disabled={!title || !amount || !selectedDate || !category}
          class="px-6 rounded-lg font-semibold text-sm shadow-sm">
          Guardar
        </Button>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-slate-200 dark:border-gray-700">
      <h2 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Historial de Transacciones</h2>
      <CustomTable data={data.transactions ?? []} ondelete={handleDelete} />
    </div>

  </div>
</div>