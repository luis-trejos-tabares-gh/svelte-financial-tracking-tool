<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import ThemeToggle from '../components/ThemeToggle.svelte';
	import LanguageSwitcher from '../components/LanguageSwitcher.svelte';
	import { ClerkProvider, UserButton, OrganizationSwitcher } from 'svelte-clerk';
	import {
		ReceiptOutline, WalletOutline, TagOutline,
		DollarOutline, CreditCardOutline, CogOutline
	} from 'flowbite-svelte-icons';
	import { theme } from '$lib/theme.svelte.js';
	import { budget } from '$lib/budget.svelte.js';
	import { setupI18n } from '$lib/i18n';
	import { _ } from 'svelte-i18n';
	import { isLoading } from 'svelte-i18n';
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';

	let { children, data } = $props();

	setupI18n();

	onMount(() => { theme.init(); budget.load(); });
	onDestroy(() => theme.destroy());

	afterNavigate(() => budget.load());

	const navItems = [
		{ href: '/',                icon: ReceiptOutline,    labelKey: 'nav.expenses'      },
		{ href: '/budgets',         icon: WalletOutline,     labelKey: 'nav.budgets'       },
		{ href: '/categories',      icon: TagOutline,        labelKey: 'nav.categories'    },
		{ href: '/currencies',      icon: DollarOutline,     labelKey: 'nav.currencies'    },
		{ href: '/payment-methods', icon: CreditCardOutline, labelKey: 'nav.paymentMethods'},
		{ href: '/settings',        icon: CogOutline,        labelKey: 'nav.settings'      },
	];

	let sidebarOpen = $state(false);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<ClerkProvider {...data}>
{#if $isLoading}
  <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
    <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
{:else}
<div class="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-900 transition-colors duration-300">

	<!-- ── Top bar ───────────────────────────────────────────────── -->
	<header class="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-gray-700
	               bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
		<div class="flex items-center gap-3 px-4 py-3">
			<!-- Hamburger (mobile) -->
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
				Hello Expenses
			</span>

			<div class="flex items-center gap-2">
				<LanguageSwitcher />
				<ThemeToggle />
				<UserButton />
			</div>
		</div>
	</header>

	<div class="flex flex-1 overflow-hidden">

		<!-- ── Sidebar ───────────────────────────────────────────── -->
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
			<!-- Org switcher -->
			<div class="px-3 pt-4 pb-2 border-b border-slate-100 dark:border-gray-800">
				<OrganizationSwitcher
					hidePersonal={true}
					afterSelectOrganizationUrl="/"
					afterCreateOrganizationUrl="/"
				/>
			</div>

			<nav class="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
				{#each navItems as item}
					{@const active = $page.url.pathname === item.href}
					<a
						href={item.href}
						onclick={() => sidebarOpen = false}
						class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
						  {active
						    ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
						    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-800'}"
					>
						<svelte:component this={item.icon} class="w-4 h-4 shrink-0" />
						{$_(item.labelKey)}
						{#if active}
							<span class="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"></span>
						{/if}
					</a>
				{/each}
			</nav>

			<div class="px-3 pb-4">
				<div class="text-xs text-slate-400 dark:text-slate-600 text-center">v0.1.0</div>
			</div>
		</aside>

		<!-- ── Main content ──────────────────────────────────────── -->
		<main class="flex-1 overflow-y-auto">
			{@render children()}
		</main>
	</div>
</div>
{/if}
</ClerkProvider>
