import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BoardsComponent } from './pages/boards/boards.component';
import { BoardComponent } from './pages/board/board.component';

const routes: Routes = [
  {
    path: '',
    component: BoardsComponent,
    title: 'My boards',
  },
  {
    path: ':boardId',
    component: BoardComponent,
    title: 'Board',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BoardsRoutingModule { }
