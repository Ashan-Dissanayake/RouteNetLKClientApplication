import {Observable} from 'rxjs';

export interface CrudMetadataService<TMetadata> {
  loadAll(): Observable<TMetadata>;
}
