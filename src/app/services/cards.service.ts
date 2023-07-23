import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { checkToken } from '@interceptors/token.interceptor';
import { Board } from '@models/board.model';
import { Card, CreateUpdateCardDto } from '@models/card.model';
import { List } from '@models/list.model';
import { User } from '@models/user.model';
import { BoardsService } from './boards.service';

@Injectable({
  providedIn: 'root'
})
export class CardsService {

  apiUrl = environment.API_URL;

  constructor(
    private http: HttpClient,
    private boardsService: BoardsService
  ) { }

  update(id: Card['id'], changes: CreateUpdateCardDto){
    return this.http.put<Card>(`${this.apiUrl}/cards/${id}`, changes, {context: checkToken()})
  }

  newCard(title: string, list: List, boardId: Board['id']) {
    console.log(list.cards.length);

    this.create({
      title: title,
      position: this.boardsService.getPositionNewElement(list.cards),
      listId: list.id,
      boardId: boardId
    }).subscribe(newCard => {
      //console.log(newCard)
      list.cards.push(newCard);
    })
  }

  create(newCard: CreateUpdateCardDto){
    return this.http.post<Card>(`${this.apiUrl}/cards/`, newCard, {context: checkToken()})
  }



}
