<script lang="ts">
  import { Table, TableHead, TableHeadCell, Button } from "flowbite-svelte";

  const { data, ondelete }: { data: any[], ondelete?: (id: string) => void } = $props();
  const transactionCount = $derived(data ? data.length : 0);
  const totalAmount = $derived(
    (data ?? []).reduce((sum: number, tx: { amount?: number }) => sum + (tx.amount ?? 0), 0)
  );

</script>

<Table hoverable={true} class="rounded-xl overflow-hidden text-sm">
    <TableHead class="bg-slate-100 dark:bg-gray-700 text-xs text-slate-600 dark:text-slate-300 uppercase tracking-wide">
        <TableHeadCell class="px-4 py-3">Titulo</TableHeadCell>
        <TableHeadCell class="px-4 py-3">Fecha</TableHeadCell>
        <TableHeadCell class="px-4 py-3">Monto</TableHeadCell>
        <TableHeadCell class="px-4 py-3">Categoria</TableHeadCell>
        <TableHeadCell class="px-4 py-3">Acciones</TableHeadCell>
  </TableHead>
  {#if (data ?? []).length === 0}
    <tr>
      <td colspan="5" class="text-center py-10 text-slate-400 dark:text-slate-500 italic">Sin transacciones aún.</td>
    </tr>
  {:else}
    {#each data ?? [] as transaction}
      <tr class="bg-white border-b border-slate-100 dark:bg-gray-800 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
        <th scope="row" class="px-4 py-3 font-semibold text-slate-800 dark:text-white whitespace-nowrap">
          {transaction.title}
        </th>
        <td class="px-4 py-3 text-slate-600 dark:text-slate-300">{new Date(transaction.date).toLocaleDateString(['es-CR'], {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })}</td>
        <td class="px-4 py-3 font-medium text-green-600 dark:text-green-400">₡{Number(transaction.amount).toLocaleString()}</td>
        <td class="px-4 py-3">
          <span class="inline-block bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300 rounded-full px-2 py-0.5 text-xs font-medium">
            {transaction.category}
          </span>
        </td>
        <td class="px-4 py-3">
          <Button size="xs" color="red" outline onclick={() => ondelete?.(transaction.id)}>Eliminar</Button>
        </td>
      </tr>
    {/each}
  {/if}
  <tfoot>
    <tr class="bg-slate-50 dark:bg-gray-900 font-semibold text-slate-700 dark:text-white text-sm">
      <th scope="row" class="px-4 py-3">Total</th>
      <td class="px-4 py-3 text-slate-500 dark:text-slate-400">{transactionCount} transacción{transactionCount !== 1 ? 'es' : ''}</td>
      <td class="px-4 py-3 text-green-600 dark:text-green-400">₡{totalAmount.toLocaleString()}</td>
      <td colspan="2"></td>
    </tr>
  </tfoot>
</Table>