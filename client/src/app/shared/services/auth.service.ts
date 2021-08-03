import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import {User} from "../interfaces";
import {Observable} from "rxjs";
import {tap} from "rxjs/operators";

// automatically add service to app.modules.ts -> providers[]
@Injectable({
  providedIn: "root"
})

export class AuthService {
  private token = null; //variable to save json web token we get from server

  constructor(private http: HttpClient) {
  }

  register(user: User): Observable<User> {
    return this.http.post<User>('/api/auth/register', user)
  }

  login(user: User): Observable<{token: string}> {
    return this.http.post<{token: string}>('/api/auth/login', user)
      .pipe( //method to work with stream
        tap( //method to allow us to catch something from the stream
          ({token}) => {
            localStorage.setItem('auth-token', token);
            this.setToken(token);
          }
        )
      )
  }

  setToken(token: string) {
    this.token = token;
  }

  getToken(): string {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token; //casting to the boolean type
  }

  logout(){
    this.setToken(null);
    localStorage.clear();
  }
}
