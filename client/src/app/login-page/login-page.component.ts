import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Subscription} from "rxjs";

import {AuthService} from "../shared/services/auth.service";
import {MaterialService} from "../shared/classes/material.service";

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit, OnDestroy {

  form: FormGroup;
  aSub: Subscription; //to prevent a leak of memory

  constructor(private auth: AuthService, //injection of service
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6)])
    });

    this.route.queryParams.subscribe((params: Params) => {
      if(params['registered']) {
        // Now, you can login to the system
        MaterialService.toast('Now, you can login to the system.');
      } else if(params['accessDenied']) {
        // Required authorization in the system
        MaterialService.toast('Required authorization in the system.');
      } else if(params['sessionExpired']) {
        MaterialService.toast('Please, login again.');
      }
    })
  }

  ngOnDestroy() {
    if(this.aSub) { // if variable exist, destroy subscription after redirect to another page from page login
      this.aSub.unsubscribe();
    }
  }

  onSubmit() {
    this.form.disable(); //to disable form when request is run

    const user = {
      email: this.form.value.email,
      password: this.form.value.password
    }
    this.aSub = this.auth.login(user).subscribe(
      () => this.router.navigate(['/overview']),
      (error) => {
        MaterialService.toast(error.error.message);
        this.form.enable();
      }
    )
  }
}
