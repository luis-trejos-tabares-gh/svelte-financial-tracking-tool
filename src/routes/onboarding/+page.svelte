<script lang="ts">
  import { useClerkContext } from 'svelte-clerk';
  import { UsersGroupOutline } from 'flowbite-svelte-icons';
  import { goto } from '$app/navigation';
  import { _ } from 'svelte-i18n';

  const ctx = useClerkContext();

  let groupName = $state('');
  let creating  = $state(false);
  let error     = $state('');

  async function createGroup() {
    if (!groupName.trim()) return;
    creating = true;
    error = '';
    try {
      await ctx.clerk?.createOrganization({ name: groupName.trim() });
      goto('/');
    } catch (e: any) {
      error = e?.errors?.[0]?.message ?? $_('onboarding.errorCreate');
    } finally {
      creating = false;
    }
  }
</script>

<svelte:head><title>{$_('onboarding.title')} · Hello Expenses</title></svelte:head>

<div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900 px-4">
  <div class="w-full max-w-md">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-slate-200 dark:border-gray-700 p-8">

      <div class="text-center mb-8">
        <div class="flex justify-center mb-3">
          <UsersGroupOutline class="w-12 h-12 text-slate-400 dark:text-slate-500" />
        </div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">{$_('onboarding.title')}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">
          {$_('onboarding.subtitle')}
        </p>
      </div>

      <!-- Create group -->
      <div class="mb-6">
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">{$_('onboarding.createGroup')}</h2>
        <div class="flex gap-2">
          <input
            type="text"
            bind:value={groupName}
            placeholder={$_('onboarding.placeholderGroupName')}
            maxlength="64"
            class="flex-1 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700
                   text-slate-800 dark:text-white text-sm px-3 py-2 outline-none
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onkeydown={(e) => e.key === 'Enter' && createGroup()}
          />
          <button
            onclick={createGroup}
            disabled={!groupName.trim() || creating}
            class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {creating ? $_('onboarding.creating') : $_('onboarding.createBtn')}
          </button>
        </div>
        {#if error}
          <p class="mt-2 text-xs text-red-500">{error}</p>
        {/if}
      </div>

      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-slate-200 dark:border-gray-700"></div>
        </div>
        <div class="relative flex justify-center text-xs">
          <span class="px-3 bg-white dark:bg-gray-800 text-slate-400">{$_('onboarding.or')}</span>
        </div>
      </div>

      <!-- Accept invite -->
      <div class="text-center">
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">{$_('onboarding.inviteTitle')}</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          {$_('onboarding.inviteSubtitle')}
        </p>
        <button
          onclick={() => window.location.reload()}
          class="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          {$_('onboarding.acceptedInvite')}
        </button>
      </div>

    </div>
  </div>
</div>
