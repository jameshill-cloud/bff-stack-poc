import { describe, beforeAll, it, expect } from "vitest";
import * as nunjucks from "nunjucks";
import { fixtures as phaseBannerFixtures } from "govuk-frontend/dist/govuk/components/phase-banner/fixtures.json";
import { normaliseHtml } from "../../../test/utilities";
import { setupNunjucksEnvironment } from "../../../test/mocks";

describe("phase banner", () => {
  let nunjucksEnv: nunjucks.Environment;

  beforeAll(async () => {
    nunjucksEnv = setupNunjucksEnvironment(__dirname);
  });

  it("should render HTML matching the appropriate govuk phase banner component fixture", async () => {
    console.log("phaseBannerFixtures:", JSON.stringify(phaseBannerFixtures));
    const fixture = phaseBannerFixtures.find(
      (fixture) => fixture.name === "default",
    );

    expect(fixture).not.toBeFalsy();

    const html = nunjucksEnv.render("partials/phase-banner.njk", {
      phaseBannerTagText: "Alpha",
      phaseBannerHtml: `This is a new service - your <a href="#" class="govuk-link">feedback</a> will help us to improve it.`,
    });
    const normalisedHtml = await normaliseHtml(html);
    const normalisedFixtureHtml = await normaliseHtml(fixture?.html || "");

    expect(normalisedHtml).toEqual(normalisedFixtureHtml);
  });
});
