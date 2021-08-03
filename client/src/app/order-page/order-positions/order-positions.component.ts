import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params} from "@angular/router";
import {PositionsService} from "../../shared/services/positions.service";
import {Observable} from "rxjs";
import {map, switchMap} from "rxjs/operators";
import {Position} from "../../shared/interfaces";
import {OrderService} from "../order.service";
import {MaterialService} from "../../shared/classes/material.service";

@Component({
  selector: 'app-order-positions',
  templateUrl: './order-positions.component.html',
  styleUrls: ['./order-positions.component.css']
})
export class OrderPositionsComponent implements OnInit {

  positions$: Observable<Position[]>

  constructor(private route: ActivatedRoute,
              private positionsService: PositionsService,
              private order: OrderService) {
  }

  ngOnInit(): void {
    this.positions$ = this.route.params // to get dynamic id params from url
      .pipe(
        // The switchMap operator returns an observable that emits items based on applying a function that you supply
        // to each item emitted by the source observable where that function returns an inner observable.
        switchMap(
          (params: Params) => {
            return this.positionsService.fetch(params['id'])
          }
        ),
        map( // mapping through positions we get from be and adding attribute "quantity" with default value "1"
          (positions:Position[]) => {
            return positions.map(position => {
              position.quantity = 1;
              return position;
            })
          }
        )
      )
  }

  addToOrder(position: Position) {
    MaterialService.toast(`Added x ${position.quantity}`)
    this.order.add(position);
  }
}
