<script lang="ts">
  import { periods, type Period } from '$lib/stores/periods';
  import { getAdminClient, supabase } from '$lib/supabase/client';
  import { peekAll, replaceAll, type QueueItem } from '$lib/utils/syncQueue';

  let authed = false;
  let pwd = '';
  let err = '';

  function login() {
    if (pwd && pwd === (import.meta.env as any).ADMIN_PASSWORD) {
      authed = true;
      err = '';
      load();
    } else {
      err = 'Invalid password';
    }
  }

  async function load() {
    const { data } = await supabase.from('periods').select('id,nickname,points,chips').order('id');
    periods.set((data as Period[]) ?? []);
  }

  async function saveNickname(p: Period, nickname: string) {
    const admin = getAdminClient();
    if (!admin) return;
    await admin.from('periods').update({ nickname }).eq('id', p.id);
    await load();
  }

  async function deltaChips(p: Period, delta: number) {
    const admin = getAdminClient();
    if (!admin) return;
    await admin.from('periods').update({ chips: Math.max(0, p.chips + delta) }).eq('id', p.id);
    await load();
  }

  async function resetDailyChips() {
    const admin = getAdminClient();
    if (!admin) return;
    await admin.from('periods').update({ chips: 5 });
    await load();
  }

  async function manualSync() {
    const admin = getAdminClient();
    if (!admin) return;
    const items = peekAll();
    const remaining: QueueItem[] = [];
    for (const it of items) {
      try {
        if (it.table === 'periods' && it.op === 'update') {
          const { id, ...fields } = it.payload as any;
          const { error } = await admin.from('periods').update(fields).eq('id', id);
          if (error) remaining.push(it);
        } else {
          remaining.push(it);
        }
      } catch {
        remaining.push(it);
      }
    }
    replaceAll(remaining);
    await load();
  }

  async function seedPeriods() {
    const admin = getAdminClient();
    if (!admin) return;
    const defaults: Period[] = [
      { id: 1, nickname: 'Period 1', points: 0, chips: 5 },
      { id: 2, nickname: 'Period 2', points: 0, chips: 5 },
    ];
    const { data } = await supabase.from('periods').select('id');
    const existing = new Set((data as { id: number }[] | null)?.map((r) => r.id) ?? []);
    const missing = defaults.filter((p) => !existing.has(p.id));
    if (missing.length > 0) {
      await admin.from('periods').insert(missing);
    }
    await load();
  }
</script>

{#if !authed}
  <div class="mx-auto mt-10 max-w-md rounded-md border border-slate-700 p-4">
    <h1 class="mb-2 text-lg font-semibold text-slate-200">Admin Login</h1>
    <input
      type="password"
      bind:value={pwd}
      class="w-full rounded bg-slate-800 p-2 text-slate-100"
      placeholder="Password"
    />
    {#if err}<p class="mt-2 text-sm text-red-400">{err}</p>{/if}
    <button class="mt-3 rounded bg-slate-700 px-3 py-2 text-slate-200" on:click={login}
      >Enter</button
    >
  </div>
{:else}
  <div class="mx-auto mt-6 max-w-2xl">
    <div class="mb-4 flex items-center gap-2">
      <button class="rounded bg-slate-700 px-3 py-2 text-slate-200" on:click={load}
        >Refresh</button
      >
      <button class="rounded bg-slate-700 px-3 py-2 text-slate-200" on:click={resetDailyChips}
        >Reset Daily Chips</button
      >
      <button class="rounded bg-slate-700 px-3 py-2 text-slate-200" on:click={manualSync}
        >Manual Sync</button
      >
      <button class="rounded bg-slate-700 px-3 py-2 text-slate-200 disabled:opacity-50" on:click={seedPeriods} disabled={$periods.length > 0}
        >Seed Periods</button
      >
    </div>
    <table class="w-full text-sm text-slate-300">
      <thead>
        <tr class="text-left text-slate-400">
          <th class="py-1">ID</th>
          <th class="py-1">Nickname</th>
          <th class="py-1 text-right">Chips</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each $periods as p}
          <tr class="border-t border-slate-700">
            <td class="py-1">{p.id}</td>
            <td class="py-1">
              <input
                class="rounded bg-slate-800 px-2 py-1 text-slate-100"
                bind:value={p.nickname}
                on:change={() => saveNickname(p, p.nickname)}
              />
            </td>
            <td class="py-1 text-right">{p.chips}</td>
            <td class="py-1 text-right">
              <button class="rounded bg-slate-700 px-2 py-1" on:click={() => deltaChips(p, 1)}
                >+1</button
              >
              <button class="ml-2 rounded bg-slate-700 px-2 py-1" on:click={() => deltaChips(p, -1)}
                >-1</button
              >
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}


