import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {CategoriesService} from "../../shared/services/categories.service";
import {switchMap} from "rxjs/operators";
import {of} from "rxjs";
import {MaterialService} from "../../shared/classes/material.service";
import {Category, Message} from "../../shared/interfaces";

@Component({
  selector: 'app-categories-form',
  templateUrl: './categories-form.component.html',
  styleUrls: ['./categories-form.component.css']
})
export class CategoriesFormComponent implements OnInit {

  @ViewChild('input') inputRef: ElementRef; // getting element from dom
  form: FormGroup; // initialize form
  image: File; // variable to save uploaded file
  imagePreview: string | ArrayBuffer = '';
  isNew = true; //anchor to understand is it add form or or edit form
  category: Category // variable to get id of category

  constructor(private route: ActivatedRoute,
              private categoriesService: CategoriesService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(null, Validators.required)
    })

    this.form.disable(); // to prevent input text in time data loading from backend

    this.route.params
      .pipe( //exactly after we read from stream params to execute next code
        switchMap((params) => { // by using method switchMap
          if(params['id']) {
            this.isNew = false;
            return this.categoriesService.getById(params['id']) // returning new stream
          }
          return of(null) // of -> allow us to create Observable from anything
          // else we return also stream with argument "null"
        })
      )
      .subscribe(
        (category: Category) => {
          if(category) { // if we get category from backend, we assign value name in our form field name
            this.category = category;
            this.form.patchValue({ ////dynamically changing the input value
              name: category.name
            });
            this.imagePreview = category.imageSrc;
            MaterialService.updateTextInputs();
          }
          this.form.enable(); // enabling form after getting data
        },
        error => MaterialService.toast(error.error.message)
      )
  }

  onSubmit() {
    let obs$ //initialize Observable to subscribe after "if"
    this.form.disable();
    if(this.isNew) {
      obs$ = this.categoriesService.create(this.form.value.name, this.image);
    } else {
      obs$ = this.categoriesService.update(this.category._id, this.form.value.name, this.image)
    }

    obs$.subscribe(
      category => {
        this.category = category;
        MaterialService.toast('The all changes were successful saved.');
        this.form.enable();
      },
      error => {
        this.form.enable();
        MaterialService.toast(error.error.message);
      }
    )
  }

  triggerClick() {
    this.inputRef.nativeElement.click();
  }

  onFileUpload(event: any) {
    const file = event.target.files[0];
    this.image = file;

    const reader = new FileReader(); // standard class of JS, help us to preview of the image
    reader.onload = () => {
      this.imagePreview = reader.result;
    }
    reader.readAsDataURL(file)
  }

  deleteCategory() {
    const decision = window.confirm(`Are you really want to delete category ${this.category.name} ?`);

    if(decision) {
      this.categoriesService.delete(this.category._id)
        .subscribe(
          (response: Message) => { // Success
            MaterialService.toast(response.message);
          },
          error => { // Error
            MaterialService.toast(error.error.message);
          },
          () => {  // In any case, it is executed
            this.router.navigate(['/categories']);
          }
        )
    }
  }
}
