export function normalizeSearchCriteria(criteria: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(criteria).map(([key, value]) => {
      if (typeof value === 'string') return [key, value.trim().toLowerCase()];
      if (value && typeof value === 'object' && 'id' in value) return [key, value.id];
      return [key, value];
    })
  );
}
