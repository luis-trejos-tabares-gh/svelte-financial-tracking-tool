<script>
  import { SignUp } from 'svelte-clerk';
  import { _ } from 'svelte-i18n';
</script>

<svelte:head><title>{$_('auth.signUp')} · {$_('common.appName')}</title></svelte:head>

<div class="min-h-[calc(100vh-57px)] flex items-center justify-center bg-slate-50 dark:bg-gray-900">
  <SignUp forceRedirectUrl="/" fallbackRedirectUrl="/" signInUrl="/sign-in" />
</div>
