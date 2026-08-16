<script>
  import { theme } from '$lib/theme.svelte.js';
  import { SunOutline, MoonOutline, DesktopPcOutline } from 'flowbite-svelte-icons';
  import { _ } from 'svelte-i18n';

  const options = [
    { value: 'light', labelKey: 'theme.light', icon: SunOutline       },
    { value: 'dark',  labelKey: 'theme.dark',  icon: MoonOutline      },
    { value: 'auto',  labelKey: 'theme.auto',  icon: DesktopPcOutline },
  ];
</script>

<div class="inline-flex rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-100 dark:bg-gray-700 p-0.5 gap-0.5 shadow-sm">
  {#each options as opt}
    <button
      onclick={() => theme.set(opt.value)}
      aria-label={$_(opt.labelKey)}
      title={$_(opt.labelKey)}
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
        {theme.mode === opt.value
          ? 'bg-white dark:bg-gray-900 text-slate-800 dark:text-white shadow'
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}"
    >
      <svelte:component this={opt.icon} class="w-3.5 h-3.5 shrink-0" />
      <span class="hidden sm:inline">{$_(opt.labelKey)}</span>
    </button>
  {/each}
</div>
