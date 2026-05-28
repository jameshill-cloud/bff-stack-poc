export interface IslandManifest {
  mountId: string;
  bundle: string;
  props: unknown;
}

export function renderIslandMount(manifest: IslandManifest): string {
  const safeProps = JSON.stringify(manifest.props)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/'/g, '\\u0027');

  return `<div id="${manifest.mountId}" data-island="${manifest.bundle}" data-props='${safeProps}'></div>`;
}
