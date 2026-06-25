<script lang="ts">
  import { Button, Input, Label, Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Toggle } from 'flowbite-svelte';
  import Snackbar from './Snackbar.svelte';

  interface Column {
    key: string;
    label: string;
    editable?: boolean;
    type?: 'text' | 'toggle';
    placeholder?: string;
  }

  interface Props {
    title:       string;
    apiPath:     string;   // e.g. '/currency'
    columns:     Column[];
    addLabel?:   string;
  }

  let { title, apiPath, columns, addLabel = 'Agregar' }: Props = $props();

  let rows        = $state<any[]>([]);
  let editingId   = $state<string | null>(null);
  let editValues  = $state<Record<string, any>>({});
  let addValues   = $state<Record<string, any>>({});
  let loading     = $state(true);

  let snackbarVisible = $state(false);
  let snackbarMessage = $state('');
  let snackbarType    = $state<'success' | 'error' | 'info'>('info');

  function toast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    snackbarMessage = message; snackbarType = type;
    snackbarVisible = true;
    setTimeout(() => (snackbarVisible = false), 3500);
  }

  async function load() {
    loading = true;
    try {
      const res = await fetch(apiPath);
      rows = await res.json();
    } catch { toast('Error al cargar los datos.', 'error'); }
    finally { loading = false; }
  }

  async function handleAdd() {
    const res = await fetch(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addValues),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast(err.message ?? 'Error al crear el registro.', 'error');
      return;
    }
    const created = await res.json();
    rows = [...rows, created];
    addValues = {};
    toast('Registro creado.', 'success');
  }

  function startEdit(row: any) {
    editingId  = row.id;
    editValues = { ...row };
  }

  async function handleSave() {
    const res = await fetch(`${apiPath}/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editValues),
    });
    if (!res.ok) { toast('Error al guardar.', 'error'); return; }
    const updated = await res.json();
    rows = rows.map(r => r.id === editingId ? updated : r);
    editingId = null;
    toast('Cambios guardados.', 'success');
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este registro?')) return;
    const res = await fetch(`${apiPath}/${id}`, { method: 'DELETE' });
    if (!res.ok) { toast('Error al eliminar.', 'error'); return; }
    rows = rows.filter(r => r.id !== id);
    toast('Registro eliminado.', 'success');
  }

  // Initial load
  $effect(() => { load(); });
</script>

<Snackbar bind:visible={snackbarVisible} message={snackbarMessage} type={snackbarType} />

<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-slate-200 dark:border-gray-700 overflow-hidden">
  <div class="px-6 py-4 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between">
    <h2 class="text-lg font-semibold text-slate-700 dark:text-slate-200">{title}</h2>
  </div>

  <!-- Add row form -->
  <div class="px-6 py-4 bg-slate-50 dark:bg-gray-900/40 border-b border-slate-200 dark:border-gray-700">
    <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-3">Nuevo registro</p>
    <div class="flex flex-wrap items-end gap-3">
      {#each columns.filter(c => c.editable !== false && c.type !== 'toggle') as col}
        <div class="flex flex-col gap-1 min-w-32">
          <Label class="text-xs font-medium">{col.label}</Label>
          <Input
            type="text"
            size="sm"
            bind:value={addValues[col.key]}
            placeholder={col.placeholder ?? col.label}
          />
        </div>
      {/each}
      <Button size="sm" color="green" onclick={handleAdd}
        disabled={columns.filter(c => c.editable !== false && c.type !== 'toggle').some(c => !addValues[c.key])}>
        {addLabel}
      </Button>
    </div>
  </div>

  <!-- Table -->
  <Table hoverable>
    <TableHead class="bg-slate-100 dark:bg-gray-700 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {#each columns as col}
        <TableHeadCell class="px-4 py-3">{col.label}</TableHeadCell>
      {/each}
      <TableHeadCell class="px-4 py-3">Acciones</TableHeadCell>
    </TableHead>
    <TableBody>
      {#if loading}
        <TableBodyRow>
          <TableBodyCell colspan={columns.length + 1} class="text-center py-10 text-slate-400 italic text-sm">
            Cargando…
          </TableBodyCell>
        </TableBodyRow>
      {:else if rows.length === 0}
        <TableBodyRow>
          <TableBodyCell colspan={columns.length + 1} class="text-center py-10 text-slate-400 italic text-sm">
            Sin registros.
          </TableBodyCell>
        </TableBodyRow>
      {:else}
        {#each rows as row}
          <TableBodyRow class="bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
            {#each columns as col}
              <TableBodyCell class="px-4 py-3">
                {#if editingId === row.id && col.editable !== false}
                  {#if col.type === 'toggle'}
                    <Toggle bind:checked={editValues[col.key]} />
                  {:else}
                    <Input type="text" size="sm" bind:value={editValues[col.key]} class="max-w-40" />
                  {/if}
                {:else if col.type === 'toggle'}
                  <span class="inline-flex items-center gap-1 text-xs font-medium {row[col.key] ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}">
                    {row[col.key] ? '✓ Activo' : '✗ Inactivo'}
                  </span>
                {:else}
                  <span class="text-slate-700 dark:text-slate-200 text-sm">{row[col.key] ?? '—'}</span>
                {/if}
              </TableBodyCell>
            {/each}
            <TableBodyCell class="px-4 py-3">
              <div class="flex items-center gap-2">
                {#if editingId === row.id}
                  <Button size="xs" color="green" onclick={handleSave}>Guardar</Button>
                  <Button size="xs" color="light" onclick={() => editingId = null}>Cancelar</Button>
                {:else}
                  <Button size="xs" color="blue" outline onclick={() => startEdit(row)}>Editar</Button>
                  <Button size="xs" color="red"  outline onclick={() => handleDelete(row.id)}>Eliminar</Button>
                {/if}
              </div>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      {/if}
    </TableBody>
  </Table>
</div>
