import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import configuration from "../config/configuration";
import { AppModule } from "../app.module";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";
import * as nunjucks from "nunjucks";

import { sessionMiddleware } from "../common/middleware/session.middleware";
import { ValidationPipe } from "@nestjs/common";
import { HttpExceptionFilter } from "../common/filters/http-exception.filter";

export async function setupTestApp() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        load: [configuration],
        isGlobal: true,
      }),
      AppModule,
    ],
  }).compile();

  const app = moduleFixture.createNestApplication<NestExpressApplication>();

  // Configure Nunjucks
  const viewsPath = join(__dirname, "../", "views");
  const govukPath = join(
    __dirname,
    "../../",
    "node_modules",
    "govuk-frontend",
    "dist",
    "govuk",
  );

  const env = nunjucks.configure([viewsPath, govukPath], {
    autoescape: true,
    express: app.getHttpAdapter().getInstance(),
  });

  env.addGlobal(
    "govukErrors",
    (errors: Record<string, unknown>, fieldName: string) => {
      if (errors && errors[fieldName]) {
        return {
          fieldName,
          message: errors[fieldName],
        };
      }
      return null;
    },
  );

  app.setViewEngine("njk");
  app.setBaseViewsDir(viewsPath);
  app.useStaticAssets(join(__dirname, "..", "public"));
  app.use(sessionMiddleware("test-secret"));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.init();

  return app;
}

export function setupNunjucksEnvironment(baseDir: string) {
  const viewsPath = join(baseDir, "../../");
  const govukPath = join(
    baseDir,
    "../../../../node_modules/govuk-frontend/dist/govuk",
  );

  const nunjucksEnv = nunjucks.configure([viewsPath, govukPath], {
    autoescape: true,
  });

  return nunjucksEnv;
}
