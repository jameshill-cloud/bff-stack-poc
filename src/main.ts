import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import * as nunjucks from "nunjucks";
import { join } from "path";
import { AppModule } from "./app.module";
import { sessionMiddleware } from "./common/middleware/session.middleware";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService); // Type used as unique ID for config service singleton instance
  const port = configService.get<number>("port") || 3000; // mapped from env vars in `config/configuration.ts`
  const sessionSecret =
    configService.get<string>("sessionSecret") || "dev-secret";

  // Configure Nunjucks as view engine
  const viewsPath = join(__dirname, "views");

  console.log("viewsPath", viewsPath);

  const govukPath = join(
    __dirname,
    "..",
    "node_modules",
    "govuk-frontend",
    "dist",
    "govuk",
  );

  const isDevelopment = process.env.NODE_ENV !== "production";

  nunjucks.configure([viewsPath, govukPath], {
    autoescape: true,
    express: app.getHttpAdapter().getInstance(),
    noCache: isDevelopment,
  });

  // Add custom global error helper function in Nunjucks environment
  const env = nunjucks.configure([viewsPath, govukPath], {
    autoescape: true,
    express: app.getHttpAdapter().getInstance(),
    noCache: isDevelopment,
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

  // Static assets
  app.useStaticAssets(join(__dirname, "..", "public"));

  // Session middleware
  app.use(sessionMiddleware(sessionSecret));

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port, () => {
    console.log(`Application running on port ${port}`);
    console.log("Mock API running on port 3001");
  });
}

bootstrap();
