import { Injectable } from "@nestjs/common";
import { renderToString } from "react-dom/server";
import { createElement, ComponentType } from "react";

@Injectable()
export class ReactSSRService {
  render<P extends object>(component: ComponentType<P>, props: P): string {
    return renderToString(createElement(component, props));
  }
}
