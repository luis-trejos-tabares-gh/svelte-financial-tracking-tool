<script>
  import { theme } from '$lib/theme.svelte.js';

  const options = [
    { value: 'light', label: 'Light' },
    { value: 'dark',  label: 'Dark' },
    { value: 'auto',  label: 'Auto' },
  ];
</script>

<div class="inline-flex rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-100 dark:bg-gray-700 p-0.5 gap-0.5 shadow-sm">
  {#each options as opt}
    <button
      onclick={() => theme.set(opt.value)}
      aria-label={opt.label}
      title={opt.label}
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
        {theme.mode === opt.value
          ? 'bg-white dark:bg-gray-900 text-slate-800 dark:text-white shadow'
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}"
    >
      <span>{opt.icon}</span>
      <span class="hidden sm:inline">{opt.label}</span>
    </button>
  {/each}
</div>
