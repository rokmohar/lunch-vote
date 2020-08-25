import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VoterComponent } from './voter.component';

const routes: Routes = [
  { path: '', component: VoterComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VoterRoutingModule {}

