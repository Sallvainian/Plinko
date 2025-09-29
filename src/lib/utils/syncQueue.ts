export type QueueItem = {
  id: string; // uuid
  op: 'update' | 'insert' | 'delete';
  table: 'periods';
  payload: Record<string, unknown>;
  createdAt: number;
};

const KEY = 'plinko_sync_queue_v1';

function readQueue(): QueueItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as QueueItem[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(items: QueueItem[]): void {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function enqueue(item: QueueItem): void {
  const list = readQueue();
  list.push(item);
  writeQueue(list);
}

export function dequeueAll(): QueueItem[] {
  const list = readQueue();
  writeQueue([]);
  return list;
}

export function peekAll(): QueueItem[] {
  return readQueue();
}

export function replaceAll(items: QueueItem[]): void {
  writeQueue(items);
}



