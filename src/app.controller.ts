import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { ReactSSRService } from './react/ssr';
import { ExampleServerComponent } from './react/ssr/components/ExampleServerComponent';
import { ExampleIsland } from './react/islands/ExampleIsland';
import { renderIslandMount } from './react/islands/island-loader';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly reactSSRService: ReactSSRService,
  ) {}

  @Get()
  home(@Res() res: Response): void {
    const serverComponentHtml = this.reactSSRService.render(
      ExampleServerComponent,
      {
        title: 'Example Server Component',
        message: 'This is rendered on the server with React',
      },
    );

    const islandProps = { initialCount: 0 };
    const islandMount = renderIslandMount({
      mountId: 'example-island-mount',
      bundle: '/js/islands/ExampleIsland/mount.js',
      props: islandProps,
    });

    res.render('home', {
      pageTitle: 'Home',
      message: this.appService.getHello(),
      serverComponentHtml,
      islandMount,
    });
  }
}
