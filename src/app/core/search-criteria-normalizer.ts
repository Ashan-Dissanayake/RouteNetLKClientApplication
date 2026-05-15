export function normalizeSearchCriteria(criteria: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(criteria).map(([key, value]) => {
      // 1. Handle Date objects (New Logic)
      if (value instanceof Date) {
        // Using 'en-CA' is a clean way to get YYYY-MM-DD without extra libraries
        return [key, value.toLocaleDateString('en-CA')];
      }

      // 2. Handle Strings
      if (typeof value === 'string') {
        return [key, value.trim().toLowerCase()];
      }

      // 3. Handle Objects with IDs
      if (value && typeof value === 'object' && 'id' in value) {
        return [key, value.id];
      }

      return [key, value];
    })
  );
}
