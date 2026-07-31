const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

/** Formats an ISO 8601 UTC timestamp (as returned by the backend) for display. */
export function formatDate(isoTimestamp: string): string {
  return dateFormatter.format(new Date(isoTimestamp));
}
