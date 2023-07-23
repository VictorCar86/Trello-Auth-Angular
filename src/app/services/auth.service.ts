import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';
import { BehaviorSubject, switchMap, tap } from 'rxjs';
import { TokenService } from './token.service';
import { ResponseLogin } from '@models/auth.model';
import { User } from '@models/user.model';
import { checkToken } from '@interceptors/token.interceptor';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiUrl = environment.API_URL;
  user$ = new BehaviorSubject<User | null>(null);

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) { }

  login(email:string, password: string) {
    return this.http.post<ResponseLogin>(`${this.apiUrl}/auth/login`, { email, password})
    // antes de enviar la respuesta del login, guardamos el token
    .pipe(
      tap(response => {
        this.tokenService.saveToken(response.access_token);
        this.tokenService.saveRefreshToken(response.refresh_token);
      })
    )
  }

  register(name:string, email:string, password: string) {
    return this.http.post(`${this.apiUrl}/auth/register`, { name, email, password})
  }

  registerAndLogin(name:string, email:string, password:string) {
    return this.register(name, email, password)
    .pipe(
      switchMap(()=>this.login(email, password))
    );
  }

  isAvailable(email:string){
    return this.http.post<{isAvailable: boolean}>(`${this.apiUrl}/auth/is-available`, { email })
  }

  // Refresca el token con el refreshToken, el cual a su vez genera un nuevo access token y un refresh token
  refreshToken(refreshToken:string){
    return  this.http.post<ResponseLogin>(`${this.apiUrl}/auth/refresh-token`, { refreshToken })
    .pipe(
      tap(response => {
        this.tokenService.saveToken(response.access_token);
        this.tokenService.saveRefreshToken(response.refresh_token);
      })
    )
  }

  recovery(email:string){
    return this.http.post(`${this.apiUrl}/auth/recovery`, { email })
  }

  profile(){
    const token = this.tokenService.getToken();
    return this.http.get<User>(`${this.apiUrl}/auth/profile`, {
      // agregamos el contexto a la petición a fin de que el interceptor agregue el token
      context: checkToken(),
    }).pipe(
      // según obtengamos el profile lo transmitimos a trave del observable user$
      tap(user => this.user$.next(user)),
    )
  }

  changePassword(token:string, newPassword:string){
    return this.http.post(`${this.apiUrl}/auth/change-password`, { token, newPassword })
  }

  logout(){
    this.tokenService.removeToken();
    this.tokenService.removeRefreshToken();
  }

}
