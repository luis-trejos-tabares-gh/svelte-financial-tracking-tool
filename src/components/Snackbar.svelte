<script lang="ts">
  type SnackbarType = 'success' | 'error' | 'info';

  let { message, type = 'info', visible = $bindable(false) }: { message: string; type?: SnackbarType; visible?: boolean } = $props();

  const colors: Record<SnackbarType, string> = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  const icons: Record<SnackbarType, string> = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };
</script>

{#if visible}
  <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all {colors[type]}">
    <span class="text-base font-bold">{icons[type]}</span>
    <span>{message}</span>
    <button class="ml-2 opacity-70 hover:opacity-100 text-lg leading-none" onclick={() => (visible = false)}>×</button>
  </div>
{/if}
