import { Module } from "@nestjs/common";
import { ReactSSRService } from "./ssr";

@Module({
  providers: [ReactSSRService],
  exports: [ReactSSRService],
})
export class ReactModule {}
