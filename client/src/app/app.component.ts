import {Component, OnInit} from '@angular/core';
import {AuthService} from "./shared/services/auth.service";

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
  constructor(private auth: AuthService) {
  }

  ngOnInit() {
    const potentialToken = localStorage.getItem('auth-token');
    if(potentialToken !== null) { //if in localstorage exist token, we set it to authService by method setToken
      this.auth.setToken(potentialToken);
    }
  }
}
