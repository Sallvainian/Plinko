<script lang="ts">
  import { history } from '$lib/stores/periods';
  function fmt(ts: number) {
    const d = new Date(ts);
    return d.toLocaleTimeString();
  }
</script>

<div class="flex flex-col gap-2">
  <h3 class="text-sm font-semibold text-slate-300">Drop History</h3>
  {#if $history.length === 0}
    <p class="text-sm text-slate-400">No drops yet.</p>
  {:else}
    <div class="max-h-48 overflow-auto rounded border border-slate-700">
      <table class="w-full text-xs text-slate-300">
        <thead class="bg-slate-800 text-slate-400">
          <tr>
            <th class="px-2 py-1 text-left">Time</th>
            <th class="px-2 py-1 text-left">Period</th>
            <th class="px-2 py-1 text-left">Bin</th>
            <th class="px-2 py-1 text-left">Points</th>
          </tr>
        </thead>
        <tbody>
          {#each [...$history].slice().reverse() as h}
            <tr class="border-t border-slate-700">
              <td class="px-2 py-1">{fmt(h.ts)}</td>
              <td class="px-2 py-1">{h.periodId ?? '—'}</td>
              <td class="px-2 py-1">{h.binIndex ?? '—'}</td>
              <td class="px-2 py-1">{h.pointsApplied ?? '—'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

