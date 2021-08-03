import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PositionsService} from "../../../shared/services/positions.service";
import {Position} from "../../../shared/interfaces";
import {MaterialInstance, MaterialService} from "../../../shared/classes/material.service";
import {FormGroup, FormControl, Validators} from "@angular/forms";

@Component({
  selector: 'app-positions-form',
  templateUrl: './positions-form.component.html',
  styleUrls: ['./positions-form.component.css']
})
export class PositionsFormComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input('categoryId') categoryId: string; // this component wait for parameter 'categoryId' from high level component
  @ViewChild('modal') modalRef: ElementRef; // getting element from dom
  positions: Position[] = [];
  positionId = null; // variable to indicate our state (create or edit position)
  loading = false;
  modal: MaterialInstance;
  form: FormGroup;


  constructor(private positionService: PositionsService) {

  }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(null, Validators.required),
      cost: new FormControl(1, [Validators.required, Validators.min(1)])
    });

    this.loading = true;
    this.positionService.fetch(this.categoryId).subscribe(positions => {
      this.positions = positions;
      this.loading = false;
    })
  }

  ngOnDestroy() {
    this.modal.destroy();
  }

  ngAfterViewInit() { // run only after content of html is loader
    this.modal = MaterialService.initModal(this.modalRef);
  }

  onSelectPosition(position: Position) {
    this.positionId = position._id;
    this.form.patchValue({ //dynamically changing the input value
      name: position.name,
      cost: position.cost
    });
    this.modal.open();
    // Method to reinitialize all the Materialize labels on the page if you are dynamically adding inputs
    MaterialService.updateTextInputs();
  }

  onAddPosition() {
    this.positionId = null;
    this.form.patchValue({ //dynamically changing the input value
      name: null,
      cost: 1
    });
    this.modal.open();
    // Method to reinitialize all the Materialize labels on the page if you are dynamically adding inputs
    MaterialService.updateTextInputs();
  }

  onDeletePosition(event: Event, position: Position) {
    event.stopPropagation();
    //prevents further propagation of the current event in the capturing and bubbling phases.
    // click on delete button don't trigger  function onSelectPosition() built-in in link <a>

    const decision = window.confirm(`Delete position ${position.name}`);

    if(decision) {
      // delete position
      this.positionService.remove(position).subscribe(
        response => {
          // looking for the index of deleted position in local array (FE)
          const index = this.positions.findIndex(p => p._id === position._id);
          // deleting the position from local array
          this.positions.splice(index, 1);
          MaterialService.toast('Position was successfully deleted.');
        },
        error => MaterialService.toast(error.error.message)
      )
    }
  }

  onCancel() {
    this.modal.close();
  }

  onSubmit() {
    this.form.disable();

    const newPosition: Position = {
      name: this.form.value.name,
      cost: this.form.value.cost,
      category: this.categoryId
    }

    const completed = () => { //function that is executed for any outcome (success or error)
      this.modal.close();
      this.form.reset({name: '', cost: 0.01}); // clear the form
      this.form.enable();
    }

    if(this.positionId) {
      // editing the position
      newPosition._id = this.positionId;
      this.positionService.update(newPosition).subscribe(
        position => {
          // looking for the index of updated position in local array (FE)
          const index = this.positions.findIndex(p => p._id === position._id);
          // updating the local array
          this.positions[index] = position;
          MaterialService.toast('The position was successfully edited.');
        },
        error => MaterialService.toast(error.error.message),
        completed
      )
    } else {
      // creating new position
      this.positionService.create(newPosition).subscribe(
        position => {
          MaterialService.toast('New position successfully created.');
          this.positions.push(position);
        },
        error => MaterialService.toast(error.error.message),
        completed
      )
    }
  }
}
