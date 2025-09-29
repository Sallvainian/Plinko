import { describe, it, expect, beforeEach } from 'vitest';
import { enqueue, dequeueAll, peekAll } from '../../utils/syncQueue';

describe('syncQueue', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('enqueues and peeks items', () => {
    enqueue({ id: '1', op: 'update', table: 'periods', payload: { id: 1, points: 10 }, createdAt: Date.now() });
    const items = peekAll();
    expect(items.length).toBe(1);
    expect(items[0].payload).toMatchObject({ id: 1, points: 10 });
  });

  it('dequeues all and clears queue', () => {
    enqueue({ id: '1', op: 'update', table: 'periods', payload: { id: 1, points: 10 }, createdAt: Date.now() });
    enqueue({ id: '2', op: 'update', table: 'periods', payload: { id: 2, points: 5 }, createdAt: Date.now() });
    const items = dequeueAll();
    expect(items.length).toBe(2);
    expect(peekAll().length).toBe(0);
  });
});



