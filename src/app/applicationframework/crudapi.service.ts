import {Observable} from 'rxjs';

export interface CrudApiService<TEntity> {
  get(params?: Record<string, unknown>): Observable<{ data: TEntity[] }>;

  save?(data: TEntity): Observable<TEntity>;

  update?(data: TEntity): Observable<TEntity>;

  deactivate?(ids: number[]): Observable<number[]>;
}
