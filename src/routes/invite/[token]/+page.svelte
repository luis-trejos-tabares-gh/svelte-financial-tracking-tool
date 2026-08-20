<script>
  import { goto } from '$app/navigation';
  import { SignUp } from 'svelte-clerk';
  import { _ } from 'svelte-i18n';

  let { data } = $props();

  const invitePath = $derived(`/invite/${data.token ?? ''}`);
  const signInUrl = $derived(`/sign-in?redirect_url=${encodeURIComponent(invitePath)}`);

  $effect(() => {
    if (data.status === 'joined') {
      const t = setTimeout(() => goto('/'), 1200);
      return () => clearTimeout(t);
    }
  });
</script>

<svelte:head><title>{$_('invite.title')} · {$_('common.appName')}</title></svelte:head>

<div class="py-16 px-4">
  <div class="mx-auto max-w-md bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-8 text-center">
    {#if data.status === 'need_auth'}
      <p class="text-lg font-semibold text-slate-800 dark:text-white">
        {$_('invite.needAuthTitle', { values: { name: data.workspaceName } })}
      </p>
      <p class="mt-2 mb-6 text-sm text-slate-500 dark:text-slate-400">
        {$_('invite.needAuthSubtitle')}
      </p>
      <div class="flex justify-center text-left">
        <SignUp
          forceRedirectUrl={invitePath}
          fallbackRedirectUrl={invitePath}
          {signInUrl}
          initialValues={{ emailAddress: data.email }}
        />
      </div>
    {:else if data.status === 'joined'}
      <p class="text-lg font-semibold text-slate-800 dark:text-white">{$_('invite.joined', { values: { name: data.workspaceName } })}</p>
      <p class="mt-2 text-sm text-slate-500">{$_('invite.redirecting')}</p>
    {:else if data.status === 'accepted'}
      <p class="text-sm text-slate-600 dark:text-slate-300">{$_('invite.alreadyAccepted')}</p>
      <a href="/" class="mt-4 inline-block text-sm text-blue-600 dark:text-blue-400 font-medium">{$_('invite.goHome')}</a>
    {:else if data.status === 'expired'}
      <p class="text-sm text-red-500">{$_('invite.expired')}</p>
      <a href="/" class="mt-4 inline-block text-sm text-blue-600 dark:text-blue-400 font-medium">{$_('invite.goHome')}</a>
    {:else}
      <p class="text-sm text-red-500">{$_('invite.invalid')}</p>
      <a href="/" class="mt-4 inline-block text-sm text-blue-600 dark:text-blue-400 font-medium">{$_('invite.goHome')}</a>
    {/if}
  </div>
</div>
