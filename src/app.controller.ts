import { Controller, Get, Post, Res, Body } from "@nestjs/common";
import { Response } from "express";
import { AppService } from "./app.service";
import { ReactSSRService } from "./react/ssr";
import { ExampleServerComponent } from "./react/ssr/components/ExampleServerComponent";
import { renderIslandMount } from "./react/islands/island-loader";

@Controller()
export class AppController {
  private counterValue: number = 0;

  constructor(
    private readonly appService: AppService,
    private readonly reactSSRService: ReactSSRService,
  ) {}

  @Get()
  home(@Res() res: Response): void {
    const serverComponentHtml = this.reactSSRService.render(
      ExampleServerComponent,
      {
        title: "Example SSR React Component",
        message: "This is rendered on the server with React",
      },
    );

    const islandProps = { initialCount: this.counterValue };
    const islandMount = renderIslandMount({
      mountId: "example-island-mount",
      bundle: "/js/islands/ExampleIsland/mount.js",
      props: islandProps,
    });

    res.render("home", {
      pageTitle: "Home",
      message: this.appService.getHello(),
      serverComponentHtml,
      islandMount,
      counterValue: this.counterValue,
    });
  }

  @Post("/example-island")
  handleExampleIsland(@Res() res: Response, @Body() body: any): void {
    // Update the server-side counterValue from request body
    if (body.counterValue !== undefined) {
      this.counterValue = parseInt(body.counterValue);
    }

    // Conditional rendering: if action is present, it's a form submission (with page render)
    if (body.action) {
      if (body.action === "increment") {
        this.counterValue += 1;
      } else if (body.action === "decrement") {
        this.counterValue -= 1;
      }

      res.redirect("/");
    } else {
      // Silent response for debounced requests (no page re-render)
      res.json({ success: true, counterValue: this.counterValue });
    }
  }
}
