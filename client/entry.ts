import { initAll } from 'govuk-frontend';

// Initialize GOV.UK Frontend components
initAll();

// Mount React islands
document.querySelectorAll<HTMLElement>('[data-island]').forEach(async (el) => {
  const bundle = el.dataset.island;
  const props = JSON.parse(el.dataset.props ?? '{}');

  if (!bundle) return;

  const bundleUrl = new URL(bundle, window.location.origin).href;
  const mod = await import(/* @vite-ignore */ bundleUrl);

  mod.default(el, props);
});
