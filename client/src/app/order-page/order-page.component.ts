import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {MaterialInstance, MaterialService} from "../shared/classes/material.service";
import {OrderService} from "./order.service";
import {Order, OrderPosition} from "../shared/interfaces";
import {OrdersService} from "../shared/services/orders.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-order-page',
  templateUrl: './order-page.component.html',
  styleUrls: ['./order-page.component.css'],
})
export class OrderPageComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('modal') modalRef: ElementRef; // get element from dom
  modal: MaterialInstance; //variable to open, close and destroy modal window
  isRoot: boolean;
  oSub: Subscription; // to optimize our code by unsubscribing from subscriptions in method OnDestroy()
  pending = false; // variable to disable "confirm" button after first request send

  constructor(private router: Router,
              public order: OrderService,
              private ordersService: OrdersService) {
  }

  ngOnInit(): void {
    this.isRoot = this.router.url === '/order' //check url to set a flag "isRoot"
    this.router.events.subscribe(event => { // on every router event, check url to set flag
      if(event instanceof NavigationEnd) { // only if event from class NavigationEnd, to optimize code (there ara a lot of events)
        this.isRoot = this.router.url === '/order' //check url to set a flag "isRoot"
      }
    })
  }

  ngOnDestroy() {
    this.modal.destroy();
    if(this.oSub) { // unsubscribing from subscriptions
      this.oSub.unsubscribe();
    }
  }

  ngAfterViewInit() { // create instance of modal, after initializing it in the dom tree
    this.modal = MaterialService.initModal(this.modalRef);
  }

  openModal() {
    this.modal.open();
  }

  cancelModal() {
    this.modal.close();
  }

  submitModal() {
    this.pending = true;

    const order: Order = {
      list: this.order.list.map(item => { // delete _id before sending to be
        delete item._id;
        return item;
      })
    }

    this.oSub = this.ordersService.create(order).subscribe(
      newOrder => {
        MaterialService.toast(`Your order №${newOrder.order} was successfully saved.`);
        this.order.clear(); // cleaning the order after saving
      },
      error => MaterialService.toast(error.error.message),
      () => {
        this.modal.close();
        this.pending = false;
      }
    )
  }

  removePosition(orderPosition: OrderPosition) {
    this.order.remove(orderPosition);
  }
}
