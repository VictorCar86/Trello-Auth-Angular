import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { checkToken } from '@interceptors/token.interceptor';
import { Board } from '@models/board.model';
import { User } from '@models/user.model';

@Injectable({
  providedIn: 'root'
})
export class MeService {

  apiUrl = environment.API_URL;

  constructor(
    private http: HttpClient,
  ) { }

  getMeProfile(){
    return this.http.get<User>(`${this.apiUrl}/me/profile`, {context: checkToken()})
  }

  getMeBoards(){
    return this.http.get<Board[]>(`${this.apiUrl}/me/boards`, {context: checkToken()})

  }

}
