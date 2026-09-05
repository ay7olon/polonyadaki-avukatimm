import { describe, expect, it } from 'vitest';
import { getDeadlineInfo } from './deadline';

const NOW = new Date('2026-08-03T12:00:00.000Z');

describe('getDeadlineInfo', () => {
  it('returns tone "none" when there is no deadline', () => {
    const info = getDeadlineInfo(undefined, NOW);
    expect(info.hasDeadline).toBe(false);
    expect(info.tone).toBe('none');
  });

  it('marks a passed deadline as overdue', () => {
    const past = new Date(NOW.getTime() - 2 * 60 * 60 * 1000).toISOString();
    const info = getDeadlineInfo(past, NOW);
    expect(info.hasDeadline).toBe(true);
    expect(info.isOverdue).toBe(true);
    expect(info.tone).toBe('overdue');
    expect(info.label).toMatch(/önce doldu/);
  });

  it('marks a deadline within 24h as critical', () => {
    const soon = new Date(NOW.getTime() + 5 * 60 * 60 * 1000).toISOString();
    const info = getDeadlineInfo(soon, NOW);
    expect(info.isOverdue).toBe(false);
    expect(info.tone).toBe('critical');
    expect(info.label).toMatch(/kaldı/);
  });

  it('marks a deadline within 3 days as warning', () => {
    const soon = new Date(NOW.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();
    const info = getDeadlineInfo(soon, NOW);
    expect(info.tone).toBe('warning');
  });

  it('marks a far-future deadline as normal', () => {
    const farFuture = new Date(NOW.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString();
    const info = getDeadlineInfo(farFuture, NOW);
    expect(info.tone).toBe('normal');
  });

  it('handles invalid date strings gracefully', () => {
    const info = getDeadlineInfo('not-a-date', NOW);
    expect(info.hasDeadline).toBe(false);
  });
});
