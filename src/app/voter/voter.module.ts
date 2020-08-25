import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VoterComponent } from './voter.component';
import { VoterRoutingModule } from './voter-routing.module';
import { VotesListComponent } from './votes-list/votes-list.component';
import { VoteFormComponent } from './vote-form/vote-form.component';
import { MatSelectModule } from '@angular/material/select';
import { VotesSummaryComponent } from './votes-summary/votes-summary.component';
import { OrderModule } from 'ngx-order-pipe';

@NgModule({
  declarations: [
    VoterComponent,
    VoteFormComponent,
    VotesListComponent,
    VotesSummaryComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    VoterRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSelectModule,
    OrderModule,
  ],
  entryComponents: [VoteFormComponent, VotesListComponent, VotesSummaryComponent],
})
export class VoterModule {}
