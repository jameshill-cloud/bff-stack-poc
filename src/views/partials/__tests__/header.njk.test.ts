import { describe, beforeAll, it, expect } from "vitest";
import * as nunjucks from "nunjucks";
import { fixtures as headerFixtures } from "govuk-frontend/dist/govuk/components/header/fixtures.json";
import { normaliseHtml } from "../../../test/utilities";
import { setupNunjucksEnvironment } from "../../../test/mocks";

describe("header", () => {
  let nunjucksEnv: nunjucks.Environment;

  beforeAll(async () => {
    nunjucksEnv = setupNunjucksEnvironment(__dirname);
  });

  it("should render HTML matching the appropriate govuk header component fixture", async () => {
    const fixture = headerFixtures.find(
      (fixture) => fixture.name === "with product name",
    );

    expect(fixture).not.toBeFalsy();

    const html = nunjucksEnv.render("partials/header.njk", {
      productName: "Product Name",
      homepageUrl: "gov.uk",
    });
    const normalisedHtml = await normaliseHtml(html);
    const normalisedFixtureHtml = await normaliseHtml(fixture?.html || "");

    expect(normalisedHtml).toEqual(normalisedFixtureHtml);
  });
});
