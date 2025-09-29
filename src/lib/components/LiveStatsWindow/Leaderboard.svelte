<script lang="ts">
  import { periods } from '$lib/stores/periods';
  $: sorted = [...$periods].sort((a, b) => b.points - a.points);
</script>

<div class="flex flex-col gap-2">
  {#if sorted.length === 0}
    <p class="text-sm text-slate-400">No periods yet.</p>
  {:else}
    <table class="w-full text-sm text-slate-300">
      <thead>
        <tr class="text-left text-slate-400">
          <th class="py-1">Period</th>
          <th class="py-1">Nickname</th>
          <th class="py-1 text-right">Points</th>
        </tr>
      </thead>
      <tbody>
        {#each sorted as p}
          <tr class="border-t border-slate-700">
            <td class="py-1">{p.id}</td>
            <td class="py-1">{p.nickname}</td>
            <td class="py-1 text-right">{p.points}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
  
</div>


