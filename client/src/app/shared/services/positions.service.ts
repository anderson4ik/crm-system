import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Message, Position} from "../interfaces";
import {Observable} from "rxjs";


@Injectable({
  providedIn: "root"
})

export class PositionsService {
  constructor(private http: HttpClient) {
  }

  fetch(categoryId: string): Observable<Position[]> {
    return this.http.get<Position[]>(`/api/position/${categoryId}`)
  }

  create(position: Position) {
    return this.http.post<Position>('/api/position', position);
  }

  update(position: Position) {
    return this.http.patch<Position>(`/api/position/${position._id}`, position);
  }

  remove(position: Position) {
    return this.http.delete<Message>(`/api/position/${position._id}`);
  }
}
