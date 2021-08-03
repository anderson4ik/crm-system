import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Category, Message} from "../interfaces";
import {Observable} from "rxjs";

@Injectable({
  providedIn: "root"
})

export class  CategoriesService {
  constructor(private http: HttpClient) {
  }

  // Get all categories
  fetch(): Observable<Category[]> {
    return this.http.get<Category[]>('/api/category');
  }

  // get category bu id
  getById(id: string): Observable<Category> {
    return  this.http.get<Category>(`/api/category/${id}`);
  }

  // create new category
  create(name: string, image?: File): Observable<Category> {
    const fd = new FormData(); // standard class of JS, help us to send file to server

    if(image) {
      fd.append('image', image, image.name);
    }
    fd.append('name', name);

    return this.http.post<Category>('/api/category', fd);
  }

  // update category
  update(id: string, name: string, image?: File): Observable<Category> {
    const fd = new FormData(); // standard class of JS, help us to send file to server

    if(image) {
      fd.append('image', image, image.name);
    }
    fd.append('name', name);

    return this.http.patch<Category>(`/api/category/${id}`, fd);
  }

  // delete category
  delete(id: string): Observable<Message> {
    return this.http.delete<Message>(`/api/category/${id}`);
  }
}
