<script lang="ts">
  import { onMount } from 'svelte';
  import { periods, selectedPeriodId } from '$lib/stores/periods';
  import { supabase } from '$lib/supabase/client';

  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    const { data, error: err } = await supabase.from('periods').select('*').order('id');
    if (err) {
      error = 'Failed to load periods';
    } else if (data) {
      periods.set(data as any);
    }
    loading = false;
  });
</script>

<div class="flex items-center gap-2">
  <label class="text-sm text-slate-300" for="period-select">Period:</label>
  {#if loading}
    <span class="text-xs text-slate-400">Loading…</span>
  {:else if error}
    <span class="text-xs text-red-400">{error}</span>
  {:else}
    <select
      id="period-select"
      class="rounded bg-slate-800 px-2 py-1 text-sm text-slate-200"
      bind:value={$selectedPeriodId}
    >
      <option value={null}>—</option>
      {#each $periods as p}
        <option value={p.id}>{p.id} — {p.nickname}</option>
      {/each}
    </select>
  {/if}
</div>

