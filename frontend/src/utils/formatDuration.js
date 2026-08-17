export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0 seconds';

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];

  if (h > 0) parts.push(`${h} hour${h !== 1 ? 's' : ''}`);
  if (m > 0) parts.push(`${m} minute${m !== 1 ? 's' : ''}`);
  if (s > 0 && h === 0) {
    parts.push(`${s} second${s !== 1 ? 's' : ''}`);
  }

  return parts.join(' ') || '0 seconds';
};
