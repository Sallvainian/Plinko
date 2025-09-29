import { writable, derived } from 'svelte/store';

export type Period = { id: number; nickname: string; points: number; chips: number };

type HistoryItem = {
  ts: number;
  periodId: number | null; // null if no selection
  event: 'drop';
  binIndex?: number;
  pointsApplied?: number; // undefined if no selection
};

export const periods = writable<Period[]>([]);
export const selectedPeriodId = writable<number | null>(null);
export const history = writable<HistoryItem[]>([]);

export const selectedPeriod = derived([periods, selectedPeriodId], ([$periods, $id]) =>
  $periods.find((p) => p.id === $id) ?? null,
);

export function logDrop(binIndex: number, pointsApplied?: number) {
  let currentId: number | null = null;
  selectedPeriodId.subscribe((v) => (currentId = v))();
  history.update((h) => [
    ...h,
    { ts: Date.now(), periodId: currentId, event: 'drop', binIndex, pointsApplied },
  ]);
}



