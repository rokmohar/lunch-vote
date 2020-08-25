import { NgModule } from '@angular/core';
import { SafeHtmlPipe } from './safe-html.pipe';

const PIPES: NgModule['declarations'] = [SafeHtmlPipe];

@NgModule({
  declarations: [...PIPES],
  exports: [...PIPES],
})
export class SharedPipesModule {}
