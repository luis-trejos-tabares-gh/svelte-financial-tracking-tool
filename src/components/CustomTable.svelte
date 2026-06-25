<script lang="ts">
  import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Button } from "flowbite-svelte";

  const { data, ondelete }: { data: any[], ondelete?: (id: string) => void } = $props();

  const transactionCount = $derived(data ? data.length : 0);

  // Per-currency totals for the footer
  const totalByCurrency = $derived(
    (data ?? []).reduce((acc: Record<string, number>, tx: any) => {
      const cur = (tx.currency ?? 'CRC') as string;
      acc[cur] = (acc[cur] ?? 0) + (Number(tx.amount) ?? 0);
      return acc;
    }, {} as Record<string, number>)
  );

  const PAYMENT_LABELS: Record<string, string> = {
    tarjeta_credito: 'T. Crédito',
    tarjeta_debito:  'T. Débito',
    transferencia:   'Transferencia',
    sinpe:           'SINPE Móvil',
    efectivo:        'Efectivo',
    other:           'Otro',
  };

  const PAYMENT_COLORS: Record<string, string> = {
    tarjeta_credito: 'bg-blue-100   dark:bg-blue-900   text-blue-700   dark:text-blue-300',
    tarjeta_debito:  'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300',
    transferencia:   'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
    sinpe:           'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
    efectivo:        'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
  };

  function formatAmount(amount: number, currency: string): string {
    if (currency === 'USD') {
      return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `₡${Number(amount).toLocaleString('es-CR')}`;
  }

  function formatDate(raw: string): string {
    const d = new Date(raw);
    const date = d.toLocaleDateString('es-CR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0 || d.getSeconds() !== 0;
    if (!hasTime) return date;
    const time = d.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${date} ${time}`;
  }
</script>

<Table hoverable={true} class="rounded-xl overflow-hidden text-sm">
  <TableHead class="bg-slate-100 dark:bg-gray-700 text-xs text-slate-600 dark:text-slate-300 uppercase tracking-wide">
    <TableHeadCell class="px-4 py-3">Título</TableHeadCell>
    <TableHeadCell class="px-4 py-3">Fecha</TableHeadCell>
    <TableHeadCell class="px-4 py-3">Monto</TableHeadCell>
    <TableHeadCell class="px-4 py-3">Categoría</TableHeadCell>
    <TableHeadCell class="px-4 py-3">Método de Pago</TableHeadCell>
    <TableHeadCell class="px-4 py-3"></TableHeadCell>
  </TableHead>
  <TableBody>
    {#if (data ?? []).length === 0}
      <TableBodyRow>
        <TableBodyCell colspan={6} class="text-center py-10 text-slate-400 dark:text-slate-500 italic">
          Sin transacciones aún.
        </TableBodyCell>
      </TableBodyRow>
    {:else}
      {#each data ?? [] as transaction}
        <TableBodyRow class="bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
          <TableBodyCell class="px-4 py-3 font-semibold text-slate-800 dark:text-white whitespace-nowrap">
            {transaction.title}
          </TableBodyCell>
          <TableBodyCell class="px-4 py-3 text-slate-600 dark:text-slate-300">
            {formatDate(transaction.date)}
          </TableBodyCell>
          <TableBodyCell class="px-4 py-3 font-medium {(transaction.currency ?? 'CRC') === 'USD' ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}">
            {formatAmount(transaction.amount, transaction.currency ?? 'CRC')}
          </TableBodyCell>
          <TableBodyCell class="px-4 py-3">
            <span class="inline-block bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300 rounded-full px-2 py-0.5 text-xs font-medium">
              {transaction.category}
            </span>
          </TableBodyCell>
          <TableBodyCell class="px-4 py-3">
            {#if transaction.paymentMethod}
              {@const colorClass = PAYMENT_COLORS[transaction.paymentMethod] ?? 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300'}
              <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {colorClass}">
                {PAYMENT_LABELS[transaction.paymentMethod] ?? transaction.paymentMethod}
              </span>
            {:else}
              <span class="text-slate-400 dark:text-slate-500 text-xs">—</span>
            {/if}
          </TableBodyCell>
          <TableBodyCell class="px-4 py-3">
            <Button size="xs" color="red" outline onclick={() => ondelete?.(transaction.id)}>Eliminar</Button>
          </TableBodyCell>
        </TableBodyRow>
      {/each}
    {/if}
  </TableBody>
  <tfoot>
    <tr class="bg-slate-50 dark:bg-gray-900 font-semibold text-slate-700 dark:text-white text-sm">
      <th scope="row" class="px-4 py-3">Total</th>
      <td class="px-4 py-3 text-slate-500 dark:text-slate-400">
        {transactionCount} transacción{transactionCount !== 1 ? 'es' : ''}
      </td>
      <td class="px-4 py-3">
        {#each Object.entries(totalByCurrency) as [cur, total]}
          <div class="{cur === 'USD' ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}">
            {formatAmount(total, cur)}
          </div>
        {/each}
      </td>
      <td colspan="3"></td>
    </tr>
  </tfoot>
</Table>