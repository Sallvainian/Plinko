<script lang="ts">
  import { isGameSettingsOpen, isLiveStatsOpen } from '$lib/stores/layout';
  import { plinkoEngine } from '$lib/stores/game';
  import ChartLine from 'phosphor-svelte/lib/ChartLine';
  import GearSix from 'phosphor-svelte/lib/GearSix';
  import { flyAndScale } from '$lib/utils/transitions';
  import { Tooltip } from 'bits-ui';
  import { twMerge } from 'tailwind-merge';
</script>

<div class="flex flex-col gap-5 bg-slate-700 p-3 lg:max-w-80">
  <div class="text-sm text-slate-300">Classroom Mode Active</div>

  <button
    on:click={() => $plinkoEngine?.dropBall()}
    class={twMerge(
      'touch-manipulation rounded-md bg-green-500 py-3 font-semibold text-slate-900 transition-colors hover:bg-green-400 active:bg-green-600',
    )}
  >
    Drop Chip
  </button>

  <div class="mt-auto pt-5">
    <div class="flex items-center gap-4 border-t border-slate-600 pt-3">
      <!-- Settings Button -->
      <Tooltip.Root openDelay={0} closeOnPointerDown={false}>
        <Tooltip.Trigger asChild let:builder>
          <button
            use:builder.action
            {...builder}
            on:click={() => ($isGameSettingsOpen = !$isGameSettingsOpen)}
            class={twMerge(
              'rounded-full p-2 text-slate-300 transition hover:bg-slate-600 active:bg-slate-500',
              $isGameSettingsOpen && 'text-slate-100',
            )}
          >
            <GearSix class="size-6" weight="fill" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content
          inTransition={flyAndScale}
          sideOffset={4}
          class="z-30 max-w-lg rounded-md bg-white p-3 text-sm font-medium text-gray-950 drop-shadow-xl"
        >
          <Tooltip.Arrow />
          <p>{$isGameSettingsOpen ? 'Close' : 'Open'} Game Settings</p>
        </Tooltip.Content>
      </Tooltip.Root>

      <!-- Leaderboard Button -->
      <Tooltip.Root openDelay={0} closeOnPointerDown={false}>
        <Tooltip.Trigger asChild let:builder>
          <button
            use:builder.action
            {...builder}
            on:click={() => ($isLiveStatsOpen = !$isLiveStatsOpen)}
            class={twMerge(
              'rounded-full p-2 text-slate-300 transition hover:bg-slate-600 active:bg-slate-500',
              $isLiveStatsOpen && 'text-slate-100',
            )}
          >
            <ChartLine class="size-6" weight="bold" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content
          transition={flyAndScale}
          sideOffset={4}
          class="z-30 max-w-lg rounded-md bg-white p-3 text-sm font-medium text-gray-950 drop-shadow-xl"
        >
          <Tooltip.Arrow />
          <p>{$isLiveStatsOpen ? 'Close' : 'Open'} Live Stats</p>
        </Tooltip.Content>
      </Tooltip.Root>
    </div>
  </div>
</div>
