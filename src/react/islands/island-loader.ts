export interface IslandManifest {
  mountId: string;
  bundle: string;
  props: unknown;
}

export function renderIslandMount(manifest: IslandManifest): string {
  const safeProps = JSON.stringify(manifest.props)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/'/g, "\\u0027");

  // Add cache-busting query parameter with current timestamp
  // This ensures browser doesn't cache stale island bundles during development
  const bundleWithCacheBuster = `${manifest.bundle}?v=${Date.now()}`;

  return `<div id="${manifest.mountId}" data-island="${bundleWithCacheBuster}" data-props='${safeProps}'></div>`;
}
