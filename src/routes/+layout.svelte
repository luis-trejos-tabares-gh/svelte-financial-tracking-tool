<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import ThemeToggle from '../components/ThemeToggle.svelte';
	import LanguageSwitcher from '../components/LanguageSwitcher.svelte';
	import WorkspaceSwitcher from '../components/WorkspaceSwitcher.svelte';
	import { ClerkProvider, UserButton } from 'svelte-clerk';
	import { dark } from '@clerk/themes';
	import { enUS, esES, ptBR, deDE } from '@clerk/localizations';
	import {
		ReceiptOutline, WalletOutline, TagOutline,
		DollarOutline, CreditCardOutline, CogOutline
	} from 'flowbite-svelte-icons';
	import { theme } from '$lib/theme.svelte.js';
	import { budget } from '$lib/budget.svelte.js';
	import { setupI18n } from '$lib/i18n';
	import { _, isLoading, locale } from 'svelte-i18n';
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import { browser } from '$app/environment';

	let { children, data } = $props();

	const clerkProps = $derived({ initialState: data.initialState });

	setupI18n();

	onMount(() => { theme.init(); budget.load(); });
	onDestroy(() => theme.destroy());

	afterNavigate(() => budget.load());

	const CLERK_LOCALES = { en: enUS, es: esES, pt: ptBR, de: deDE };

	const clerkLocalization = $derived(CLERK_LOCALES[$locale] ?? enUS);
	const clerkAppearance = $derived({
		baseTheme: theme.isDark ? dark : undefined,
		variables: { colorPrimary: '#2563eb' },
	});

	$effect(() => {
		if (browser && $locale) document.documentElement.lang = $locale;
	});

	const navGroups = [
		{
			labelKey: 'nav.groupTransactions',
			items: [
				{ href: '/',        icon: ReceiptOutline, labelKey: 'nav.expenses' },
				{ href: '/budgets', icon: WalletOutline,  labelKey: 'nav.budgets'  },
			],
		},
		{
			labelKey: 'nav.groupCatalog',
			items: [
				{ href: '/categories',      icon: TagOutline,        labelKey: 'nav.categories'     },
				{ href: '/currencies',      icon: DollarOutline,     labelKey: 'nav.currencies'     },
				{ href: '/payment-methods', icon: CreditCardOutline, labelKey: 'nav.paymentMethods' },
			],
		},
		{
			labelKey: undefined,
			items: [
				{ href: '/settings',      icon: CogOutline,        labelKey: 'nav.settings'     },
			],
		},
	];

	let sidebarOpen = $state(false);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#key `${theme.mode}-${$locale}`}
<ClerkProvider {...clerkProps} appearance={clerkAppearance} localization={clerkLocalization}>
{#if $isLoading}
  <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
    <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
{:else if !data.signedIn}
	<div class="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-900">
		<header class="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-gray-700
		               bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
			<div class="flex items-center gap-3 px-4 py-3">
				<span class="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-tight flex-1">
					{$_('common.appName')}
				</span>
				<div class="flex items-center gap-2">
					<LanguageSwitcher />
					<ThemeToggle />
				</div>
			</div>
		</header>
		<main class="flex-1">
			{@render children()}
		</main>
	</div>
{:else}
<div class="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-900 transition-colors duration-300">

	<header class="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-gray-700
	               bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
		<div class="flex items-center gap-3 px-4 py-3">
			<button
				class="lg:hidden p-1.5 rounded-lg text-slate-500 dark:text-slate-400
				       hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
				onclick={() => sidebarOpen = !sidebarOpen}
				aria-label={$_('nav.menu')}
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
					      d="M4 6h16M4 12h16M4 18h16"/>
				</svg>
			</button>

			<span class="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-tight flex-1">
				{$_('common.appName')}
			</span>

			<div class="flex items-center gap-2">
				<LanguageSwitcher />
				<ThemeToggle />
				<UserButton />
			</div>
		</div>
	</header>

	<div class="flex flex-1 overflow-hidden">

		{#if sidebarOpen}
			<div
				class="fixed inset-0 z-30 bg-black/40 lg:hidden"
				onclick={() => sidebarOpen = false}
				aria-hidden="true"
			></div>
		{/if}

		<aside class="
			fixed top-16 left-0 bottom-0 z-40
			w-56 shrink-0 flex flex-col
			bg-white dark:bg-gray-900
			border-r border-slate-200 dark:border-gray-700
			transform transition-transform duration-200
			lg:static lg:translate-x-0 lg:top-0
			{sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
		">
			<div class="px-2 pt-3 pb-2 border-b border-slate-100 dark:border-gray-800">
				<WorkspaceSwitcher
					workspaces={data.workspaces}
					activeWorkspaceId={data.activeWorkspaceId}
				/>
			</div>

			<nav class="flex-1 overflow-y-auto py-4 px-3 flex flex-col">
				{#each navGroups as group, i}
					<div class="mt-1">
						{#if group.labelKey}
						<p class="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
							{$_(group.labelKey)}
						</p>
						{/if}
						<div class="space-y-0.5">
							{#each group.items as item}
								{@render navLink(item)}
							{/each}
						</div>
					</div>
				{/each}
			</nav>

			{#snippet navLink(item)}
				{@const active = $page.url.pathname === item.href}
				{@const Icon = item.icon}
				<a
					href={item.href}
					onclick={() => sidebarOpen = false}
					class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
					  {active
					    ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
					    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-800'}"
				>
					<Icon class="w-4 h-4 shrink-0" />
					{#if item.labelKey}{$_(item.labelKey)}{/if}
					{#if active}
						<span class="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"></span>
					{/if}
				</a>
			{/snippet}

			<div class="px-3 pb-4">
				<div class="text-xs text-slate-400 dark:text-slate-600 text-center">v0.1.0</div>
			</div>
		</aside>

		<main class="flex-1 overflow-y-auto">
			{@render children()}
		</main>
	</div>
</div>
{/if}
</ClerkProvider>
{/key}
