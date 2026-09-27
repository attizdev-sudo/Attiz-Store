/**
 * Calculates and formats the expected delivery date for an order.
 * Uses official Shiprocket courier EDD if present, or falls back to orderDate + 8 days.
 */
export function getExpectedDeliveryInfo(createdAt: string | number | Date, edd?: string | null) {
  // 1. If official EDD from Shiprocket courier is available
  if (edd && typeof edd === 'string') {
    const cleanEdd = edd.trim();
    if (cleanEdd && cleanEdd !== 'null' && cleanEdd !== '0000-00-00 00:00:00') {
      const normalizedStr = cleanEdd.includes(' ') && !cleanEdd.includes('T')
        ? cleanEdd.replace(' ', 'T')
        : cleanEdd;
      const eddDate = new Date(normalizedStr);
      if (!isNaN(eddDate.getTime())) {
        const dayName = eddDate.toLocaleDateString('en-IN', { weekday: 'long' });
        const formattedDate = `${eddDate.getDate()}-${eddDate.getMonth() + 1}-${eddDate.getFullYear()}`;
        const fullDateString = eddDate.toLocaleDateString('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        return { dayName, formattedDate, fullDateString, isOfficialEdd: true };
      }
    }
  }

  // 2. Default estimate fallback: Order Date + 8 days
  if (!createdAt) return { fullDateString: '', formattedDate: '', dayName: '', isOfficialEdd: false };
  const orderDate = new Date(createdAt);
  const expectedDate = new Date(orderDate);
  expectedDate.setDate(orderDate.getDate() + 8);

  const dayName = expectedDate.toLocaleDateString('en-IN', { weekday: 'long' });
  const formattedDate = `${expectedDate.getDate()}-${expectedDate.getMonth() + 1}-${expectedDate.getFullYear()}`;
  const fullDateString = expectedDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return { dayName, formattedDate, fullDateString, isOfficialEdd: false };
}

