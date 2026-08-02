import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, finalize, Observable, Subject, takeUntil, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {DriverService} from '../api/driver.service';
import {Driver} from '../../entity/driver';
import {normalizeSearchCriteria} from '../../../../core/search-criteria-normalizer';
import {Regex} from '../../../../shared/models/regex.model';
import {RegexService} from '../../../../core/regex.service';
import {DriverMapper} from '../../../../shared/mappers/DriverMapper';
import {DriverMetadata, EMPTY_DRIVER_METADATA} from '../../model/driver.metadata.model';
import {DriverMetadataService} from './driver.metadata.service';
import {BaseFacade} from '../../../../shared/base/base.facade';

@Injectable()
export class DriverFacadeService
  extends BaseFacade<Driver, DriverMetadata> {

  readonly drivers$ = this.items$;

  constructor(
    private driverService: DriverService,
    private driverMetadataService: DriverMetadataService,
    private regexService: RegexService,
  ) {
    super(
      driverService,
      driverMetadataService,
      EMPTY_DRIVER_METADATA,
    );
  }

  protected override validateCreate(data: Driver): string | null {
    const status = data.crewstatus?.name?.toLowerCase();

    return status !== 'eligible'
      ? 'Driver must have an eligible status to be created.'
      : null;
  }

  protected override beforeCreate(data: Driver): Driver {
    return DriverMapper.fromForm(data);
  }

  protected override beforeUpdate(data: Driver): Driver {
    return DriverMapper.fromForm(data);
  }

  loadStaticRegexes(): Observable<Regex> {
    return this.regexService.getStaticRegexes('drivers').pipe(
      map(res => res.data),
    );
  }

  getDriversSnapshot(): Driver[] {
    return this.itemsSubject.getValue();
  }
}
