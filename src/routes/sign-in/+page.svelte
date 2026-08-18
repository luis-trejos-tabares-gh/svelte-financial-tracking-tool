<script>
  import { SignIn } from 'svelte-clerk';
  import { page } from '$app/stores';
  import { _ } from 'svelte-i18n';

  const redirectUrl = $derived($page.url.searchParams.get('redirect_url') || '/');
</script>

<svelte:head><title>{$_('auth.signIn')} · {$_('common.appName')}</title></svelte:head>

<div class="min-h-[calc(100vh-57px)] flex items-center justify-center bg-slate-50 dark:bg-gray-900">
  <SignIn forceRedirectUrl={redirectUrl} fallbackRedirectUrl="/" signUpUrl="/sign-up" />
</div>
