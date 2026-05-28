import { copyFileSync, mkdirSync, cpSync } from 'fs';
import { join } from 'path';

const govukDistPath = join(
  __dirname,
  '..',
  'node_modules',
  'govuk-frontend',
  'dist',
  'govuk',
);
const publicAssetsPath = join(__dirname, '..', 'public', 'assets');

// Create public/assets directory if it doesn't exist
mkdirSync(publicAssetsPath, { recursive: true });

// Copy CSS
console.log('Copying GOV.UK Frontend assets...');
try {
  copyFileSync(
    join(govukDistPath, 'govuk-frontend.min.css'),
    join(publicAssetsPath, 'govuk-frontend.min.css'),
  );
  console.log('✓ Copied govuk-frontend.min.css');
} catch (err: any) {
  console.error('Error copying CSS:', err.message);
}

// Copy fonts
try {
  cpSync(join(govukDistPath, 'fonts'), join(publicAssetsPath, 'fonts'), {
    recursive: true,
    force: true,
  });
  console.log('✓ Copied fonts/');
} catch (err: any) {
  console.warn('Fonts not found, skipping:', err.message);
}

// Copy images
try {
  cpSync(join(govukDistPath, 'images'), join(publicAssetsPath, 'images'), {
    recursive: true,
    force: true,
  });
  console.log('✓ Copied images/');
} catch (err: any) {
  console.warn('Images not found, skipping:', err.message);
}

console.log('Asset copying complete.');
