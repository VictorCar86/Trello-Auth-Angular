import { BoardsService } from './../../../../services/boards.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Dialog } from '@angular/cdk/dialog';
import { TodoDialogComponent } from '@boards/components/todo-dialog/todo-dialog.component';

import { ToDo, Column } from '@models/todo.model';
import { ActivatedRoute } from '@angular/router';
import { Board } from '@models/board.model';
import { Card } from '@models/card.model';
import { CardsService } from '@services/cards.service';
import { map, tap, switchMap } from 'rxjs';
import { List } from '@models/list.model';
import { FormControl, Validators } from '@angular/forms';
import { ListService } from '@services/list.service';
import { BACKGROUND } from '@models/colors.model';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styles: [
    `
      .cdk-drop-list-dragging .cdk-drag {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }
      .cdk-drag-animating {
        transition: transform 300ms cubic-bezier(0, 0, 0.2, 1);
      }
    `,
  ],
})
export class BoardComponent implements OnInit, OnDestroy {

  board: Board | null = null;
  inputCard = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  inputList = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  showListForm = false;
  colorBackground = BACKGROUND;

  constructor(
    private dialog: Dialog,
    private route: ActivatedRoute,
    private boardsService: BoardsService,
    private cardsService: CardsService,
    private listService: ListService
  ) {}

  ngOnInit(): void {
    this.boardsService.board$.subscribe((board) => (this.board = board));
    this.route.paramMap.subscribe((params) => {
      const id = params.get('boardId');
      if (id) {
        this.getBoard(id);
      }
    });
  }

  /* Este metodo se ejecuta cada vez que se sale del componente */
  ngOnDestroy(): void {
    this.boardsService.setBackgroundColor('sky');
  }

  private getBoard(id: string) {
    this.boardsService
      .getBoard(id)
      //.showForm, es un estado de cada list del board que se utiliza cuando se presiona el boton de
      // agregar card, para mostros u ocultar el input que aparece
      .pipe(
        tap(
          // se inicializa en false
          (board) => board.lists.map((list) => (list.showForm = false))
        )
      )
      .subscribe((board) => {
        this.board = board;
        // seteamos el color del background del navbar
        this.boardsService.setBackgroundColor(this.board.backgroundColor);
      });
  }

  /* Funcion que se ejecuta cuando soltamos una card luego de moverla,
  - event: representa la card
  - .container.data: data del container donde se esta moviendo
  - .currentindex: indice actual de la card
  - .previousIndex: indice previo
  - .previousContainer.data: data del contenedor anterior */
  drop(event: CdkDragDrop<Card[]>) {
    // dentro de la misma lista
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      // transferencia a otra lista
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    // calculamos la posición de la card que se movió
    const pos = this.boardsService.getPosition(
      event.container.data,
      event.currentIndex
    );

    // obtenemos la card
    const card = event.container.data[event.currentIndex];
    // obtenemos el id de la lista a la que se movió
    const listId = event.container.id;
    // Actualizamos la card
    this.updateCard(card, pos, listId);
  }

  /* Actualiza la posicion de la card */
  private updateCard(card: Card, position: number, listId: string) {
    this.cardsService
      .update(card.id, { position, listId })
      .subscribe((cardUpdated) => {
        console.log(cardUpdated);
      });
  }

  openDialog(card: Card) {
    const dialogRef = this.dialog.open(TodoDialogComponent, {
      minWidth: '300px',
      maxWidth: '50%',
      data: {
        card: card,
      },
    });
    dialogRef.closed.subscribe((output) => {
      console.log(output);
    });
  }

  /* Deja abierto solo el form de la lista que seleccionamos */
  openFormCard(listSel: List) {
    const board = this.board;
    if (board?.lists) {
      board.lists.map((list) => {
        list.id === listSel.id
          ? (list.showForm = true)
          : (list.showForm = false);
      });
    }
  }

  saveCard(listSel: List) {
    this.cardsService.newCard(this.inputCard.value, listSel, this.board!.id);
    this.inputCard.reset();
    listSel.showForm = false;
  }

  addList(){
    if (this.board){
      this.listService.create({
        title: this.inputList.value,
        boardId: this.board!.id,
        position: this.boardsService.getPositionNewElement(this.board.lists),
      }).subscribe(list => {
        // se agrega la lista al array, pero debido a que el backend no retorna un Array de cards, se lo agregamos
        this.board?.lists.push({...list, cards:[]});
        this.showListForm = false;
        this.inputList.reset();
      })
    }
  }

  get colors(){
    if(this.board){
      const classes = this.colorBackground[this.board.backgroundColor];
      return classes ? classes : {};
    }
    return {};
  }

}
