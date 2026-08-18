<script lang="ts">
  import { useClerkContext } from 'svelte-clerk';
  import { goto, invalidateAll } from '$app/navigation';
  import { _ } from 'svelte-i18n';

  let { data } = $props();
  const ctx = useClerkContext();

  let inviteEmail   = $state('');
  let inviteSending = $state(false);
  let inviteMessage = $state('');
  let inviteError   = $state(false);
  let inviteUrl     = $state('');

  async function sendInvite() {
    if (!inviteEmail.trim()) return;
    inviteSending = true;
    inviteMessage = '';
    inviteUrl = '';
    try {
      const res = await fetch('/settings/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const body = await res.json();
      inviteMessage = body.message;
      inviteUrl = body.inviteUrl ?? '';
      inviteError = !res.ok;
      if (res.ok) inviteEmail = '';
    } finally {
      inviteSending = false;
    }
  }

  let leaving = $state(false);

  async function leaveWorkspace() {
    if (!confirm($_('settings.leaveConfirm'))) return;
    leaving = true;
    try {
      const res = await fetch('/workspace/leave', { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.message ?? $_('settings.leaveError'));
        leaving = false;
        return;
      }
      await invalidateAll();
      goto('/');
    } catch {
      alert($_('settings.leaveError'));
      leaving = false;
    }
  }

  let deleteConfirmText = $state('');
  let deletingAccount   = $state(false);
  const deletePhrase = $derived($_('settings.deletePhrase'));

  async function deleteAccount() {
    if (deleteConfirmText !== deletePhrase) return;
    deletingAccount = true;
    try {
      await ctx.user?.delete();
      goto('/sign-in');
    } catch {
      alert($_('settings.deleteError'));
      deletingAccount = false;
    }
  }

  function maskEmail(email: string) {
    if (!email || !email.includes('@')) return email || '—';
    const [local, domain] = email.split('@');
    return `${local[0]}${'*'.repeat(Math.min(local.length - 1, 4))}@${domain}`;
  }
</script>

<svelte:head><title>{$_('settings.title')} · {$_('common.appName')}</title></svelte:head>

<div class="py-8 px-4">
  <div class="mx-auto max-w-2xl space-y-6">

    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-white">{$_('settings.title')}</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{$_('settings.subtitle')}</p>
    </div>

    <section class="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-6">
      <h2 class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">{$_('settings.profileSection')}</h2>
      <div class="flex items-center gap-4">
        {#if data.user.imageUrl}
          <img src={data.user.imageUrl} alt="Avatar" class="w-14 h-14 rounded-full object-cover" />
        {:else}
          <div class="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-xl font-bold">
            {(data.user.firstName?.[0] ?? data.user.emailAddresses?.[0]?.emailAddress?.[0] ?? '?').toUpperCase()}
          </div>
        {/if}
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-slate-800 dark:text-white">
            {[data.user.firstName, data.user.lastName].filter(Boolean).join(' ') || $_('settings.noName')}
          </p>
          <p class="text-sm text-slate-500 dark:text-slate-400 truncate">
            {maskEmail(data.user.emailAddresses?.[0]?.emailAddress ?? '')}
          </p>
        </div>
        <button
          onclick={() => ctx.clerk?.openUserProfile()}
          class="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium shrink-0"
        >
          {$_('settings.editProfile')}
        </button>
      </div>
    </section>

    <section class="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-6">
      <h2 class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
        {$_('settings.workspaceSection')} — {data.workspace?.name}
      </h2>

      <ul class="divide-y divide-slate-100 dark:divide-gray-700 mb-5">
        {#each data.members as m}
          <li class="py-3 flex items-center gap-3">
            {#if m.imageUrl}
              <img src={m.imageUrl} alt="" class="w-8 h-8 rounded-full object-cover" />
            {:else}
              <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-300">
                {(m.firstName?.[0] ?? '?').toUpperCase()}
              </div>
            {/if}
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                {[m.firstName, m.lastName].filter(Boolean).join(' ') || $_('settings.memberDefault')}
              </p>
              <p class="text-xs text-slate-400 truncate">{maskEmail(m.email)}</p>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full font-medium
              {m.isOwner
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                : 'bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-slate-400'}">
              {m.isOwner ? $_('settings.owner') : $_('settings.member')}
            </span>
          </li>
        {/each}
      </ul>

      <div>
        <p class="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">{$_('settings.inviteTitle')}</p>
        <div class="flex gap-2">
          <input
            type="email"
            bind:value={inviteEmail}
            placeholder={$_('settings.invitePlaceholder')}
            class="flex-1 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700
                   text-slate-800 dark:text-white text-sm px-3 py-2 outline-none
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onkeydown={(e) => e.key === 'Enter' && sendInvite()}
          />
          <button
            onclick={sendInvite}
            disabled={!inviteEmail.trim() || inviteSending}
            class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {inviteSending ? $_('settings.inviteSending') : $_('settings.inviteBtn')}
          </button>
        </div>
        {#if inviteMessage}
          <p class="mt-1.5 text-xs {inviteError ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}">{inviteMessage}</p>
        {/if}
        {#if inviteUrl}
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400 break-all">{inviteUrl}</p>
        {/if}
      </div>

      {#if data.canLeave}
        <div class="mt-4 pt-4 border-t border-slate-100 dark:border-gray-700">
          <button
            onclick={leaveWorkspace}
            disabled={leaving}
            class="text-sm text-red-500 hover:text-red-600 dark:text-red-400 font-medium disabled:opacity-50"
          >
            {leaving ? $_('settings.leavingWorkspace') : $_('settings.leaveWorkspace')}
          </button>
        </div>
      {/if}
    </section>

    <section class="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-900/50 p-6">
      <h2 class="text-sm font-semibold text-red-500 uppercase tracking-wider mb-4">{$_('settings.dangerZone')}</h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mb-3">
        {$_('settings.deleteAccountDescPrefix')}
        <span class="font-mono font-semibold text-slate-800 dark:text-white">{deletePhrase}</span>
        {$_('settings.deleteAccountDescSuffix')}
      </p>
      <div class="flex gap-2">
        <input
          type="text"
          bind:value={deleteConfirmText}
          placeholder={deletePhrase}
          class="flex-1 rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-gray-700
                 text-slate-800 dark:text-white text-sm px-3 py-2 outline-none
                 focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        <button
          onclick={deleteAccount}
          disabled={deleteConfirmText !== deletePhrase || deletingAccount}
          class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold
                 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {deletingAccount ? $_('settings.deletingAccount') : $_('settings.deleteBtn')}
        </button>
      </div>
    </section>

  </div>
</div>
