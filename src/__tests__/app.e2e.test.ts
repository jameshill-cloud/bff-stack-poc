import { describe, beforeAll, afterAll, it, expect } from "vitest";
import request from "supertest";
import { NestExpressApplication } from "@nestjs/platform-express";
import { setupTestApp } from "../test/mocks";

describe("App (e2e)", () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await setupTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /", () => {
    it("should return 200", () => {
      return request(app.getHttpServer()).get("/").expect(200);
    });

    it("should contain GOV.UK layout markup", () => {
      return request(app.getHttpServer())
        .get("/")
        .expect(200)
        .expect((res: any) => {
          expect(res.text).toContain("govuk-template");
          expect(res.text).toContain("govuk-header");
          expect(res.text).toContain("govuk-main-wrapper");
          expect(res.text).toContain("govuk-footer");
        });
    });

    it("should contain phase banner", () => {
      return request(app.getHttpServer())
        .get("/")
        .expect(200)
        .expect((res: any) => {
          expect(res.text).toContain("govuk-phase-banner");
          expect(res.text).toContain("DEMO");
        });
    });

    it("should contain React server-side rendered content", () => {
      return request(app.getHttpServer())
        .get("/")
        .expect(200)
        .expect((res: any) => {
          expect(res.text).toContain("govuk-panel");
          expect(res.text).toContain("Example SSR React Component");
          expect(res.text).toContain(
            "This is rendered on the server with React",
          );
        });
    });

    it("should contain island mount point", () => {
      return request(app.getHttpServer())
        .get("/")
        .expect(200)
        .expect((res: any) => {
          expect(res.text).toContain("data-island");
          expect(res.text).toContain("example-island-mount");
          expect(res.text).toContain("/js/islands/ExampleIsland/mount.js");
        });
    });

    it("should include entry script", () => {
      return request(app.getHttpServer())
        .get("/")
        .expect(200)
        .expect((res: any) => {
          expect(res.text).toContain("/js/entry.js");
        });
    });

    it("should include GOV.UK Frontend CSS", () => {
      return request(app.getHttpServer())
        .get("/")
        .expect(200)
        .expect((res: any) => {
          expect(res.text).toContain("/assets/govuk-frontend.min.css");
        });
    });
  });
});
