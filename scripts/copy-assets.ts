import { copyFileSync, mkdirSync, cpSync, statSync } from "fs";
import { join, basename } from "path";

const govukDistPath = join(
  __dirname,
  "..",
  "node_modules",
  "govuk-frontend",
  "dist",
  "govuk",
);
const govukAssetsPath = join(govukDistPath, "assets");
const publicAssetsPath = join(__dirname, "..", "public", "assets");

console.log("Copying assets...");

// Create public/assets directory if it doesn't exist
mkdirSync(publicAssetsPath, { recursive: true });

// Copy CSS
try {
  copyFileSync(
    join(govukDistPath, "govuk-frontend.min.css"),
    join(publicAssetsPath, "govuk-frontend.min.css"),
  );
  console.log("✓ Copied govuk-frontend.min.css");
} catch (err: any) {
  console.error("Error copying CSS:", err.message);
}
console.log("Copying custom CSS...");
try {
  copyFileSync(
    join(__dirname, "../src/css/example-island.css"),
    join(publicAssetsPath, "example-island.css"),
  );
  console.log("✓ Copied example-island.css");
} catch (err: any) {
  console.error("Error copying CSS:", err.message);
}

// Copy fonts
try {
  cpSync(join(govukAssetsPath, "fonts"), join(publicAssetsPath, "fonts"), {
    recursive: true,
    force: true,
  });
  console.log("✓ Copied fonts/");
} catch (err: any) {
  console.warn("Fonts not found, skipping:", err.message);
}

// Copy images
try {
  cpSync(join(govukAssetsPath, "images"), join(publicAssetsPath, "images"), {
    recursive: true,
    force: true,
  });
  console.log("✓ Copied images/");
} catch (err: any) {
  console.warn("Images not found, skipping:", err.message);
}

// Copy views
try {
  cpSync(join(__dirname, "../src/views"), join(__dirname, "../dist/views"), {
    recursive: true,
    filter: (src) => {
      const name = basename(src);

      if (name === "__tests__") {
        return false;
      }

      const stat = statSync(src);

      if (stat.isDirectory()) {
        return true;
      }

      const isNjk = src.endsWith(".njk");
      return isNjk;
    },
  });
  console.log("✓ Copied views/");
} catch (err: any) {
  console.error("Error copying views:", err.message);
}

console.log("Asset copying complete.");
