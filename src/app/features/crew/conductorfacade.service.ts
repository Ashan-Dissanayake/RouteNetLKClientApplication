import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ConductorService} from './service/conductor.service';
import {Conductor} from './model/conductor';

@Injectable({
  providedIn: 'root',
})
export class ConductorFacadeService {

  constructor(
    private conductorService: ConductorService,
  ) {
  }

  // Load data
  loadConductors(): Observable<Conductor[]> {
    return this.getConductors();
  }
  // Private helpers
  private getConductors(params?: any): Observable<Conductor[]> {
    return this.conductorService.get(params).pipe(map(res => res.data));
  }



}
