const APPROVED_PUBLICATION_STATUS = "approved";

/**
 * Publication is intentionally explicit. Missing records, missing statuses, and
 * misspelled statuses all fail closed instead of leaking unfinished partners.
 */
export function isExplicitlyApproved(record) {
  return record?.publicationStatus === APPROVED_PUBLICATION_STATUS;
}

export function approvedOperatorForActivity(activity, operatorRecords = []) {
  if (!activity?.operatorId) return null;
  const operator = operatorRecords.find((candidate) => candidate?.id === activity.operatorId);
  return isExplicitlyApproved(operator) ? operator : null;
}

export function isActivityPublishable(activity, operatorRecords = []) {
  return isExplicitlyApproved(activity) && !!approvedOperatorForActivity(activity, operatorRecords);
}

export function publishedCatalog(operatorRecords = [], activityRecords = []) {
  const operators = operatorRecords.filter(isExplicitlyApproved);
  const activities = activityRecords.filter((activity) => isActivityPublishable(activity, operators));
  return { operators, activities };
}

export function approvedRecords(records = []) {
  return records.filter(isExplicitlyApproved);
}
