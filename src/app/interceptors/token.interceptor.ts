import { AuthService } from '@services/auth.service';
import { TokenService } from './../services/token.service';
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpContextToken,
  HttpContext,
} from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';

const CHECK_TOKEN = new HttpContextToken<boolean>(() => false);

export function checkToken(){
  return new HttpContext().set(CHECK_TOKEN, true);
}

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(
    private tokenService: TokenService,
    private authService: AuthService
  ) {}

  /* se verifica si el contexto de la solicitud contiene una propiedad llamada CHECK_TOKEN */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.context.get(CHECK_TOKEN)) {

      // verificamos si el access token actual es válido
      const isValidToken = this.tokenService.isValidToken();

      // si es valido lo agregamos a la petición, sino se va a actualizar los tokens
      if (isValidToken) {
        return this.addToken(request, next);
      }
      else {
        return this.updateAccessTokenAndRefreshToken(request, next);
      }
    }
    return next.handle(request);
  }

  /* Intercepta la petición (request), estrae el token de la cookie y la agrega a los header de la petición */
  private addToken(request: HttpRequest<unknown>, next: HttpHandler){
    const accessToken = this.tokenService.getToken();
    if (accessToken) {
      const authRequest = request.clone({
        headers: request.headers.set('Authorization', 'Bearer ' + accessToken),
      });
      return next.handle(authRequest);
    }
    return next.handle(request);
  }

  /* Actualiza los Tokens:
  - obtiene el refresh token guardado y se verifica si todavia es valido ese refresh token
  - si es asi, se obtienen los nuevos tokens y se agregan a la petición
  */
  private updateAccessTokenAndRefreshToken(request: HttpRequest<unknown>, next: HttpHandler){
    const refreshToken = this.tokenService.getRefreshToken();
    const isValidRefreshToken = this.tokenService.isValidRefreshToken();

    if (isValidRefreshToken && refreshToken){
      return this.authService.refreshToken(refreshToken).pipe(
        switchMap(()=> this.addToken(request,next)),
      )
    }
    return next.handle(request);
  }

}