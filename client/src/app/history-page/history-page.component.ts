import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MaterialInstance, MaterialService} from "../shared/classes/material.service";
import {OrdersService} from "../shared/services/orders.service";
import {Subscription} from "rxjs";
import {Filter, Order} from "../shared/interfaces";

const STEP = 2 // how many elements (orders) we load once

@Component({
  selector: 'app-history-page',
  templateUrl: './history-page.component.html',
  styleUrls: ['./history-page.component.css']
})
export class HistoryPageComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('tooltip') tooltipRef: ElementRef;
  tooltip: MaterialInstance; //variable to delete instance of tooltip after we go out from page
  oSub: Subscription; // to optimize our code by unsubscribing from subscriptions in method OnDestroy()
  isFilterVisible: Boolean = false;
  orders: Order[] = [];
  loading = false; // variable to show loader by additional loading
  reloading = false // variable to show loader by using filter
  noMoreOrders = false // flag to understand, when all orders fetched from be
  filter: Filter = {}

  offset = 0;
  limit = STEP;

  constructor(private ordersService: OrdersService) {
  }

  ngOnInit(): void {
    this.reloading = true;
    this.fetch();
  }

  private fetch() {

    const params = Object.assign({}, this.filter, {
      offset: this.offset,
      limit: this.limit
    });

    this.oSub = this.ordersService.fetch(params).subscribe(orders => {
      this.orders = this.orders.concat(orders); // to concat two arrays prev and next, to save all loaded orders
      this.noMoreOrders = orders.length < STEP;
      this.loading = false;
      this.reloading = false;
    })
  }

  ngOnDestroy() {
    this.tooltip.destroy(); //cleaning the memory from instance "tooltip"
    this.oSub.unsubscribe(); // unsubscribing from subscriptions
  }

  ngAfterViewInit() {
    this.tooltip = MaterialService.initTooltip(this.tooltipRef)
  }

  loadMore() {
    this.offset += STEP;
    this.loading = true;
    this.fetch();
  }

  applyFilter(filter: Filter) {
    this.orders = [] //clear array of order from oldest data
    this.offset = 0;
    this.filter = filter;
    this.reloading = true;
    this.fetch();
  }

  isFiltered(): boolean {
    return Object.keys(this.filter).length !== 0; // check if object filter has attributes
  }
}
