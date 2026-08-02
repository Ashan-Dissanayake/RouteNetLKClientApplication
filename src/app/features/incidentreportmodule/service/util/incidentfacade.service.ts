import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Incident} from '../../entity/incident';
import {IncidentService} from '../api/incident.service';
import {EMPTY_INCIDENT_METADATA, IncidentMetadata} from '../../model/incidentreport.metadata.model';
import {IncidentMetadataService} from './incident.metadata.service';
import {BaseFacade} from '../../../../shared/base/base.facade';

@Injectable()
export class IncidentFacadeService extends BaseFacade<Incident, IncidentMetadata> {

  readonly incidents$ = this.items$;

  constructor(
    private incidentService: IncidentService,
    private incidentMetadataService: IncidentMetadataService,
  ) {
    super(
      incidentService,
      incidentMetadataService,
      EMPTY_INCIDENT_METADATA
    );
  }

  // ===== Domain operations =====
  inProgress(incident: Incident): Observable<Incident> {
    return this.incidentService.inProgress(incident.id);
  }

  vehicleRecovery(incident: Incident): Observable<Incident> {
    return this.incidentService.vehicleRecovery(incident.id);
  }

  pendingAllocation(incident: Incident): Observable<Incident> {
    return this.incidentService.pendingAllocation(incident.id);
  }

  resolved(incident: Incident): Observable<Incident> {
    return this.incidentService.resolved(incident.id);
  }

  closed(incident: Incident): Observable<Incident> {
    return this.incidentService.closed(incident.id);
  }

}
