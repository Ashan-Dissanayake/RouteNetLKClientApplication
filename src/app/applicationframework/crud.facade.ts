import {Observable} from 'rxjs';

export interface CrudFacade<TEntity, TMetadata> {
  readonly items$: Observable<TEntity[]>;
  readonly metadata$: Observable<TMetadata>;
  readonly loading$: Observable<boolean>;
  readonly error$: Observable<unknown>;

  initialize(): Observable<TMetadata>;
  reload(): void;
  filter(criteria: Record<string, unknown>): void;

  create?(data: TEntity): Observable<TEntity>;
  update?(data: TEntity): Observable<TEntity>;
  deactivate?(items: TEntity[]): Observable<number[]>;
}
