<script>
  import { SignUp } from 'svelte-clerk';
  import { page } from '$app/stores';
  import { _ } from 'svelte-i18n';

  const redirectUrl = $derived($page.url.searchParams.get('redirect_url') || '/');
  const signInUrl = $derived(
    redirectUrl !== '/'
      ? `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`
      : '/sign-in'
  );
</script>

<svelte:head><title>{$_('auth.signUp')} · {$_('common.appName')}</title></svelte:head>

<div class="min-h-[calc(100vh-57px)] flex items-center justify-center bg-slate-50 dark:bg-gray-900">
  <SignUp forceRedirectUrl={redirectUrl} fallbackRedirectUrl="/" {signInUrl} />
</div>
