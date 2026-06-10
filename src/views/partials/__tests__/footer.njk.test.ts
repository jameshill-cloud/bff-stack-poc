import { describe, beforeAll, it, expect } from "vitest";
import * as nunjucks from "nunjucks";
import { fixtures as footerFixtures } from "govuk-frontend/dist/govuk/components/footer/fixtures.json";
import { normaliseHtml } from "../../../test/utilities";
import { setupNunjucksEnvironment } from "../../../test/mocks";

describe("footer", () => {
  let nunjucksEnv: nunjucks.Environment;

  beforeAll(async () => {
    nunjucksEnv = setupNunjucksEnvironment(__dirname);
  });

  it("should render HTML matching the appropriate govuk footer component fixture", async () => {
    const fixture = footerFixtures.find(
      (fixture) => fixture.name === "with meta",
    );

    expect(fixture).not.toBeFalsy();

    const html = nunjucksEnv.render("partials/footer.njk", {
      footerLinksTitle: "Items",
      footerLinks: [
        { href: "#1", text: "Item 1" },
        { href: "#2", text: "Item 2" },
        { href: "#3", text: "Item 3" },
      ],
    });
    const normalisedHtml = await normaliseHtml(html);
    const normalisedFixtureHtml = await normaliseHtml(fixture?.html || "");

    expect(normalisedHtml).toEqual(normalisedFixtureHtml);
  });
});
