// Compare the last acknowledged browser snapshot, not the entire directory.
export function recordPatch(before = {}, after = {}) {
  const patch = {}, expected = {};
  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
    if (key === 'updatedAt' || JSON.stringify(before[key]) === JSON.stringify(after[key])) continue;
    patch[key] = after[key] ?? null;
    expected[key] = before[key] ?? null;
  }
  return { patch, expected };
}

export function createRecordSync(write) {
  let acknowledged = {}, persisted = {}, chain = Promise.resolve();
  return {
    seed(records, stored = records) { acknowledged = structuredClone(records); persisted = structuredClone(stored); },
    save(records) {
      const snapshot = structuredClone(records);
      const operation = chain.then(async () => {
        for (const [id, record] of Object.entries(snapshot)) {
          const { patch } = recordPatch(acknowledged[id], record);
          if (!Object.keys(patch).length) continue;
          const expected = Object.fromEntries(Object.keys(patch).map(key => [key, persisted[id]?.[key] ?? null]));
          await write(id, patch, expected);
          acknowledged[id] = record;
          persisted[id] = { ...(persisted[id] || {}), ...patch };
        }
      });
      chain = operation.catch(() => {});
      return operation;
    },
  };
}
