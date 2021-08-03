import {Injectable} from "@angular/core";
import {OrderPosition, Position} from "../shared/interfaces";

// automatically add service to app.modules.ts -> providers[]
@Injectable({
  providedIn: "root"
})

export class OrderService {

  public list: OrderPosition[] = [];
  public totalSum = 0;

  add(position: Position) {
    // creating new object using object position
    const orderPosition: OrderPosition = Object.assign({}, {
      name: position.name,
      cost: position.cost,
      quantity: position.quantity,
      _id: position._id
    });
    // looking for the same items to sum their quantity
    const candidate = this.list.find(p => p._id === orderPosition._id);

    if(candidate) {
      // change only the quantity of item
      candidate.quantity += orderPosition.quantity;
    } else {
      // add new item to array list
      this.list.push(orderPosition);
    }

    this.computeTotalSum();
  }

  remove(orderPosition: OrderPosition){
    const index = this.list.findIndex(p => p._id === orderPosition._id);
    this.list.splice(index, 1);

    this.computeTotalSum();
  }

  clear() {
    this.list = [];
    this.totalSum = 0;
  }

  private  computeTotalSum() {
    this.totalSum = this.list.reduce((total, item) => {
      return total += item.quantity * item.cost;
    }, 0);
  }
}
