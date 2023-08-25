import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { checkToken } from '@interceptors/token.interceptor';
import { Board } from '@models/board.model';
import { Card } from '@models/card.model';
import { Colors } from '@models/colors.model';
import { List } from '@models/list.model';

@Injectable({
  providedIn: 'root'
})
export class BoardsService {

  apiUrl = environment.API_URL;
  bufferSpace = 65535;
  board = new BehaviorSubject<Board | null>(null);
  board$ = this.board.asObservable();
  backgroundColor$ = new BehaviorSubject<Colors>('sky');

  constructor(
    private http: HttpClient,
  ) { }

  getBoard(id: Board['id']){
    return this.http.get<Board>(`${this.apiUrl}/boards/${id}`, {context: checkToken()})
  }

  /* Esta función obtiene la posición del element (card o list) que se esta moviendo, esta se ejecuta luego de moverse el elemento */

  getPosition(elements: Card[] | List[], currentIndex:number) {
    // si la cantidad de elementos es 1 es porque estaba vacia anteriormente, es nuevo el elemento,
    // por lo que su posicion sera la misma que el bufferSpace
    if (elements.length === 1){
      return this.bufferSpace;
    }
    // si tiene mas de un elemento y su indice es 0 se movio al tope, por lo que se toma la posicion
    // del elemento que estaba en el tope y se divide entre 2.
    if (elements.length > 1 && currentIndex === 0){
      const onTopPosition = elements[1].position
      return onTopPosition / 2;
    }
    // si tiene mas de dos elementos, su indice es mayor a 0 y menor al ultimo, se esta agregando en el medio,
    // se toma la posicion del elemento anterior y del proximo y se divide entre dos

    const lastIndex = elements.length - 1;
    const onBottomPosition = elements[lastIndex - 1].position;
    if (elements.length > 2 && currentIndex > 0 && currentIndex < lastIndex){
      const prevPosition = elements[currentIndex -1].position;
      const nextPosition = elements[currentIndex +1].position;
      return (prevPosition + nextPosition) / 2;
    }
    // si tiene mas de un elemento y su indice es igual al ultimo, se esta moviendo al fondo, se toma la posicion del ultimo,
    // y se le suma el buffer Space
      if (elements.length > 1 && currentIndex === lastIndex){
        return onBottomPosition + this.bufferSpace
      }

    return 0;
  }

  getPositionNewElement(elements: Card[] | List[]){
    if (elements.length === 0){
      return this.bufferSpace;
    }else{
      const lastIndex = elements.length -1
      return elements[lastIndex].position + this.bufferSpace;
    }
  }

  createBoard(title: string, backgroundColor: Colors){
    return this.http.post<Board>(`${this.apiUrl}/boards`, {title, backgroundColor}, {context: checkToken()})
  }

  setBackgroundColor(color: Colors){
    this.backgroundColor$.next(color)
  }

}
