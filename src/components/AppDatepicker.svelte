<script lang="ts">
  import { Datepicker, Label, type DateOrRange } from 'flowbite-svelte';

  interface Props {
    /** Bound date value */
    value?: Date | undefined;
    label?: string;
    id?: string;
    placeholder?: string;
    /** Earliest selectable date (maps to Flowbite's availableFrom) */
    minDate?: Date | undefined;
    /** Latest selectable date (maps to Flowbite's availableTo) */
    maxDate?: Date | undefined;
    /** Show an additional time input below the calendar */
    showTime?: boolean;
    /** Extra classes forwarded to the wrapper div */
    class?: string;
  }

  let {
    value = $bindable(undefined),
    label = '',
    id = crypto.randomUUID(),
    placeholder = 'Selecciona una fecha',
    minDate = undefined,
    maxDate = undefined,
    showTime = false,
    class: extraClass = '',
  }: Props = $props();

  // ── Time state (12-hour) ──────────────────────────────────────
  const HOURS   = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')); // 01–12
  const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));      // 00–59

  function from24(h24: number): { hour: string; minute: string; period: 'AM' | 'PM' } {
    const period: 'AM' | 'PM' = h24 < 12 ? 'AM' : 'PM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return { hour: String(h12).padStart(2, '0'), minute: '00', period };
  }

  function to24(hour: string, period: 'AM' | 'PM'): number {
    let h = parseInt(hour, 10);
    if (period === 'AM') return h === 12 ? 0 : h;
    return h === 12 ? 12 : h + 12;
  }

  const initial = value ? from24(value.getHours()) : { hour: '12', minute: '00', period: 'AM' as const };
  let hour   = $state(initial.hour);
  let minute = $state(value ? String(value.getMinutes()).padStart(2, '0') : '00');
  let period = $state<'AM' | 'PM'>(initial.period);

  function mergeTime(date: Date): Date {
    const merged = new Date(date);
    merged.setHours(to24(hour, period), parseInt(minute, 10), 0, 0);
    return merged;
  }

  function handleApply(detail: DateOrRange) {
    if (!(detail instanceof Date)) return;
    value = showTime ? mergeTime(detail) : detail;
  }

  function handleClear() {
    value  = undefined;
    hour   = '12';
    minute = '00';
    period = 'AM';
  }

  function onTimeChange() {
    if (value) value = mergeTime(value);
  }
</script>

<div class={extraClass}>
  {#if label}
    <Label for={id} class="mb-1 block text-sm font-medium">{label}</Label>
  {/if}
  <div class="flex items-start gap-2">
    <!-- Datepicker shrinks to share the row when showTime is on -->
    <div class={showTime ? 'min-w-0 flex-1' : 'w-full'}>
      <Datepicker
        {id}
        bind:value
        {placeholder}
        availableFrom={minDate}
        availableTo={maxDate}
        showActionButtons
        autohide={false}
        onapply={handleApply}
        onclear={handleClear}
      />
    </div>

    {#if showTime}
      <!-- Single inline row: HH : MM  AM|PM -->
      <div
        class="flex items-center gap-1 shrink-0"
        class:opacity-40={!value}
        class:pointer-events-none={!value}
      >
        <select
          bind:value={hour}
          onchange={onTimeChange}
          class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700
                 text-slate-800 dark:text-white text-sm px-1 py-2 focus:ring-2 focus:ring-blue-500 w-13"
        >
          {#each HOURS as h}<option value={h}>{h}</option>{/each}
        </select>

        <span class="text-slate-400 dark:text-slate-500 font-bold text-base leading-none">:</span>

        <select
          bind:value={minute}
          onchange={onTimeChange}
          class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700
                 text-slate-800 dark:text-white text-sm px-1 py-2 focus:ring-2 focus:ring-blue-500 w-13"
        >
          {#each MINUTES as m}<option value={m}>{m}</option>{/each}
        </select>

        <!-- AM / PM pill -->
        <div class="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden text-xs font-semibold h-9.5">
          {#each ['AM', 'PM'] as p}
            <button
              type="button"
              onclick={() => { period = p as 'AM' | 'PM'; onTimeChange(); }}
              class="px-2 py-2 transition-colors
                {period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-600'}"
            >{p}</button>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
