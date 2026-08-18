<script>
  import { invalidateAll } from '$app/navigation';
  import { _ } from 'svelte-i18n';
  import { budget } from '$lib/budget.svelte.js';
  import { ChevronDownOutline } from 'flowbite-svelte-icons';

  let { workspaces = [], activeWorkspaceId = null } = $props();

  let open = $state(false);
  let creating = $state(false);
  let newName = $state('');
  let error = $state('');

  const active = $derived(workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0]);

  async function select(id) {
    if (id === activeWorkspaceId) { open = false; return; }
    await fetch('/workspace/active', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId: id }),
    });
    open = false;
    await invalidateAll();
    budget.load();
  }

  async function create() {
    const name = newName.trim();
    if (!name) return;
    creating = true;
    error = '';
    try {
      const res = await fetch('/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        error = body.message ?? $_('workspace.errorCreate');
        return;
      }
      newName = '';
      open = false;
      await invalidateAll();
      budget.load();
    } finally {
      creating = false;
    }
  }
</script>

<div class="relative">
  <button
    type="button"
    onclick={() => open = !open}
    class="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm font-medium
           text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
  >
    <span class="truncate">{active?.name ?? $_('workspace.switcherLabel')}</span>
    <ChevronDownOutline class="w-4 h-4 shrink-0 text-slate-400" />
  </button>

  {#if open}
    <div class="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-slate-200 dark:border-gray-700
                bg-white dark:bg-gray-800 shadow-lg p-1">
      {#each workspaces as w}
        <button
          type="button"
          onclick={() => select(w.id)}
          class="w-full text-left px-3 py-2 rounded-lg text-sm truncate
            {w.id === activeWorkspaceId
              ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700'}"
        >
          {w.name}
        </button>
      {/each}
      <div class="border-t border-slate-100 dark:border-gray-700 mt-1 pt-1 px-1 pb-1">
        <input
          type="text"
          bind:value={newName}
          placeholder={$_('workspace.namePlaceholder')}
          class="w-full rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700
                 text-slate-800 dark:text-white text-xs px-2 py-1.5 outline-none mb-1
                 focus:ring-2 focus:ring-blue-500"
          onkeydown={(e) => e.key === 'Enter' && create()}
        />
        <button
          type="button"
          onclick={create}
          disabled={!newName.trim() || creating}
          class="w-full py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white
                 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? $_('workspace.creating') : $_('workspace.create')}
        </button>
        {#if error}
          <p class="mt-1 text-xs text-red-500">{error}</p>
        {/if}
      </div>
    </div>
  {/if}
</div>
