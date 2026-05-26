/** URL / dev shortcuts — e.g. http://localhost:5174/?complete=1 */

export function readDebugFlags() {
  const params = new URLSearchParams(window.location.search);
  const truthy = (v) => v === "1" || v === "true" || v === "yes";
  return {
    complete: truthy(params.get("complete")),
    debug: truthy(params.get("debug")),
    hard: truthy(params.get("hard")),
    part: params.get("part")?.toLowerCase() ?? null,
  };
}
