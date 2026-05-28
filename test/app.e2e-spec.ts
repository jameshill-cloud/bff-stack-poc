import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import request from 'supertest';
import * as nunjucks from 'nunjucks';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import configuration from '../src/config/configuration';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { sessionMiddleware } from '../src/common/middleware/session.middleware';

describe('App (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
          isGlobal: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();

    // Configure Nunjucks
    const viewsPath = join(__dirname, '..', 'views');
    const govukPath = join(__dirname, '..', 'node_modules', 'govuk-frontend', 'dist', 'govuk');

    const env = nunjucks.configure([viewsPath, govukPath], {
      autoescape: true,
      express: app.getHttpAdapter().getInstance(),
    });

    env.addGlobal('govukErrors', (errors: Record<string, unknown>, fieldName: string) => {
      if (errors && errors[fieldName]) {
        return {
          fieldName,
          message: errors[fieldName],
        };
      }
      return null;
    });

    app.setViewEngine('njk');
    app.setBaseViewsDir(viewsPath);
    app.useStaticAssets(join(__dirname, '..', 'public'));
    app.use(sessionMiddleware('test-secret'));
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /', () => {
    it('should return 200', () => {
      return request(app.getHttpServer()).get('/').expect(200);
    });

    it('should contain GOV.UK layout markup', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res: any) => {
          expect(res.text).toContain('govuk-template');
          expect(res.text).toContain('govuk-header');
          expect(res.text).toContain('govuk-main-wrapper');
          expect(res.text).toContain('govuk-footer');
        });
    });

    it('should contain phase banner', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res: any) => {
          expect(res.text).toContain('govuk-phase-banner');
          expect(res.text).toContain('ALPHA');
        });
    });

    it('should contain React server-side rendered content', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res: any) => {
          expect(res.text).toContain('govuk-panel');
          expect(res.text).toContain('Example Server Component');
          expect(res.text).toContain('rendered on the server with React');
        });
    });

    it('should contain island mount point', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res: any) => {
          expect(res.text).toContain('data-island');
          expect(res.text).toContain('example-island-mount');
          expect(res.text).toContain('/js/islands/ExampleIsland/mount.js');
        });
    });

    it('should include entry script', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res: any) => {
          expect(res.text).toContain('/js/entry.js');
        });
    });

    it('should include GOV.UK Frontend CSS', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res: any) => {
          expect(res.text).toContain('/assets/govuk-frontend.min.css');
        });
    });
  });
});
