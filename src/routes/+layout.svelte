<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import ThemeToggle from '../components/ThemeToggle.svelte';
	import BudgetBar from '../components/BudgetBar.svelte';
	import { theme } from '$lib/theme.svelte.js';
	import { onMount, onDestroy } from 'svelte';

	let { children } = $props();

	onMount(() => theme.init());
	onDestroy(() => theme.destroy());
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
	<header class="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
		<div class="mx-auto max-w-screen-5xl flex items-center justify-between px-4 py-3">
			<span class="text-sm font-semibold text-slate-700 dark:text-slate-200 tracking-tight">💸 Hello Expenses</span>
			<ThemeToggle />
		</div>
	</header>
	<BudgetBar />

	<main class="flex-1">
		{@render children()}
	</main>
</div>
