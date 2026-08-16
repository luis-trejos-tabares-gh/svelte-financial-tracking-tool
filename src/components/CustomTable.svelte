<script lang="ts">
  import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Button } from "flowbite-svelte";
  import { _ } from 'svelte-i18n';
  import { fmtAmount, fmtDate } from '$lib/i18n';

  const { data, ondelete }: { data: any[], ondelete?: (id: string) => void } = $props();

  const transactionCount = $derived(data ? data.length : 0);

  const totals = $derived(
    (data ?? []).reduce((acc: Record<string, { income: number; expense: number }>, tx: any) => {
      const cur  = (tx.currency ?? 'CRC') as string;
      const type = (tx.type ?? 'expense') as string;
      if (!acc[cur]) acc[cur] = { income: 0, expense: 0 };
      acc[cur][type === 'income' ? 'income' : 'expense'] += Number(tx.amount) ?? 0;
      return acc;
    }, {} as Record<string, { income: number; expense: number }>)
  );

  const PAYMENT_COLORS: Record<string, string> = {
    tarjeta_credito: 'bg-blue-100   dark:bg-blue-900   text-blue-700   dark:text-blue-300',
    tarjeta_debito:  'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300',
    transferencia:   'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
    sinpe:           'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
    efectivo:        'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
  };
</script>

<Table hoverable={true} class="rounded-xl overflow-hidden text-sm">
  <TableHead class="bg-slate-100 dark:bg-gray-700 text-xs text-slate-600 dark:text-slate-300 uppercase tracking-wide">
    <TableHeadCell class="px-4 py-3">{$_('table.titleCol')}</TableHeadCell>
    <TableHeadCell class="px-4 py-3">{$_('table.dateCol')}</TableHeadCell>
    <TableHeadCell class="px-4 py-3">{$_('table.typeCol')}</TableHeadCell>
    <TableHeadCell class="px-4 py-3">{$_('table.amountCol')}</TableHeadCell>
    <TableHeadCell class="px-4 py-3">{$_('table.categoryCol')}</TableHeadCell>
    <TableHeadCell class="px-4 py-3">{$_('table.paymentMethodCol')}</TableHeadCell>
    <TableHeadCell class="px-4 py-3"></TableHeadCell>
  </TableHead>
  <TableBody>
    {#if (data ?? []).length === 0}
      <TableBodyRow>
        <TableBodyCell colspan={7} class="text-center py-10 text-slate-400 dark:text-slate-500 italic">
          {$_('transactions.noTransactions')}
        </TableBodyCell>
      </TableBodyRow>
    {:else}
      {#each data ?? [] as transaction}
        {@const isIncome = (transaction.type ?? 'expense') === 'income'}
        <TableBodyRow class="bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
          <TableBodyCell class="px-4 py-3 font-semibold text-slate-800 dark:text-white whitespace-nowrap">
            {transaction.title}
          </TableBodyCell>
          <TableBodyCell class="px-4 py-3 text-slate-600 dark:text-slate-300">
            {fmtDate(transaction.date)}
          </TableBodyCell>
          <TableBodyCell class="px-4 py-3">
            <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium
              {isIncome
                ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'}">
              {isIncome ? $_('transactions.typeIncome') : $_('transactions.typeExpense')}
            </span>
          </TableBodyCell>
          <TableBodyCell class="px-4 py-3 font-medium {isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}">
            {isIncome ? '+' : '-'}{fmtAmount(transaction.amount, transaction.currency ?? 'CRC')}
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
                {$_('paymentLabels.' + transaction.paymentMethod, { default: transaction.paymentMethod })}
              </span>
            {:else}
              <span class="text-slate-400 dark:text-slate-500 text-xs">—</span>
            {/if}
          </TableBodyCell>
          <TableBodyCell class="px-4 py-3">
            <Button size="xs" color="red" outline onclick={() => ondelete?.(transaction.id)}>
              {$_('common.delete')}
            </Button>
          </TableBodyCell>
        </TableBodyRow>
      {/each}
    {/if}
  </TableBody>
  <tfoot>
    <tr class="bg-slate-50 dark:bg-gray-900 font-semibold text-slate-700 dark:text-white text-sm">
      <th scope="row" class="px-4 py-3">Total</th>
      <td class="px-4 py-3 text-slate-500 dark:text-slate-400">
        {$_('transactions.count', { values: { count: transactionCount } })}
      </td>
      <td class="px-4 py-3"></td>
      <td class="px-4 py-3">
        {#each Object.entries(totals) as [cur, { income, expense }]}
          <div class="text-emerald-600 dark:text-emerald-400 text-xs">
            +{fmtAmount(income, cur)}
          </div>
          <div class="text-red-500 dark:text-red-400 text-xs">
            -{fmtAmount(expense, cur)}
          </div>
          {@const net = income - expense}
          <div class="text-slate-500 dark:text-slate-400 text-xs border-t border-slate-200 dark:border-gray-700 mt-0.5 pt-0.5">
            {$_('transactions.net', { values: { amount: `${net >= 0 ? '+' : ''}${fmtAmount(Math.abs(net), cur)}` } })}
          </div>
        {/each}
      </td>
      <td colspan="3"></td>
    </tr>
  </tfoot>
</Table>
