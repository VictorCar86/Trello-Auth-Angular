import { Injectable } from '@angular/core';
import jwt_decode, { JwtPayload } from "jwt-decode";
import { setCookie, getCookie, removeCookie } from 'typescript-cookie';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor() { }

  // trabajamos el token del usuario en las cookies

  saveToken(token: string){
    setCookie('token-trello', token, { expires: 365, path: '/' });
  }

  getToken(){
    return getCookie('token-trello');
  }

  removeToken(){
    removeCookie('token-trello');
  }

  saveRefreshToken(token: string){
    setCookie('refresh-token-trello', token, { expires: 365, path: '/' });
  }

  getRefreshToken(){
    return getCookie('refresh-token-trello');
  }

  removeRefreshToken(){
    removeCookie('refresh-token-trello');
  }

  /* Si hay un token lo decodifica y se verifica si la fecha de expiración es mayor a la fecha actual
  (estas fechas estan codificadas en segundos) */
  isValidToken(){
    const token = this.getToken();
    if(!token){
      return false;
    }

    const decodeToken = jwt_decode<JwtPayload>(token);
    // se verifica que el token tenga la fecha de expiracion
    if(decodeToken && decodeToken?.exp){
      const tokenDate = new Date(0);
      tokenDate.setUTCSeconds(decodeToken.exp);
      const today = new Date();
      return tokenDate.getTime() > today.getTime();
    }
    return false;
  }

  isValidRefreshToken(){
    const refreshToken = this.getRefreshToken();
    if(!refreshToken){
      return false;
    }

    const decodeToken = jwt_decode<JwtPayload>(refreshToken);
    // se verifica que el token tenga la fecha de expiracion
    if(decodeToken && decodeToken?.exp){
      const tokenDate = new Date(0);
      tokenDate.setUTCSeconds(decodeToken.exp);
      const today = new Date();
      return tokenDate.getTime() > today.getTime();
    }
    return false;
  }

}
