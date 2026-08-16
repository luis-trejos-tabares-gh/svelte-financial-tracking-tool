<script>
  import { locale } from 'svelte-i18n';
  import { SUPPORTED_LOCALES, LOCALE_LABELS, setLocale } from '$lib/i18n';
</script>

<div class="inline-flex rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-100 dark:bg-gray-700 p-0.5 gap-0.5 shadow-sm">
  {#each SUPPORTED_LOCALES as code}
    <button
      type="button"
      onclick={() => setLocale(code)}
      aria-label={LOCALE_LABELS[code]}
      title={LOCALE_LABELS[code]}
      class="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
        {$locale === code
          ? 'bg-white dark:bg-gray-900 text-slate-800 dark:text-white shadow'
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}"
    >
      {LOCALE_LABELS[code]}
    </button>
  {/each}
</div>
