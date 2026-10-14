import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Incident} from '../../entity/incident';
import {IncidentService} from '../api/incident.service';
import {EMPTY_INCIDENT_METADATA, IncidentMetadata} from '../../model/incidentreport.metadata.model';
import {IncidentMetadataService} from './incident.metadata.service';
import {BaseFacade} from '../../../../applicationframework/base.facade';

@Injectable()
export class IncidentFacadeService
  extends BaseFacade<Incident, IncidentMetadata> {

  constructor(
    private incidentService: IncidentService,
    metadataService: IncidentMetadataService,
  ) {
    super(
      incidentService,
      metadataService,
      EMPTY_INCIDENT_METADATA
    );
  }

  // ===== Deactivation business rule =====

  protected override getDeactivationIds(
    incidents: Incident[]
  ): number[] {

    return incidents
      .filter(incident =>
        // Keep your existing incident-specific
        // deactivation eligibility rule here.
        // Example:
        (incident.incidentstatus?.name ?? '').toLowerCase() === 'closed'
      )
      .map(incident => incident.id)
      .filter(
        (id): id is number => id != null
      );
  }

  protected override getNoQualifyingDeactivateErrorMessage(): string {
    return 'Selected incidents cannot be deactivated because none are closed.';
  }

  // ===== Domain-specific status transitions =====

  inProgress(
    incident: Incident
  ): Observable<Incident> {

    return this.incidentService.inProgress(
      incident.id
    );
  }

  vehicleRecovery(
    incident: Incident
  ): Observable<Incident> {

    return this.incidentService.vehicleRecovery(
      incident.id
    );
  }

  pendingAllocation(
    incident: Incident
  ): Observable<Incident> {

    return this.incidentService.pendingAllocation(
      incident.id
    );
  }

  resolved(
    incident: Incident
  ): Observable<Incident> {

    return this.incidentService.resolved(
      incident.id
    );
  }

  closed(
    incident: Incident
  ): Observable<Incident> {

    return this.incidentService.closed(
      incident.id
    );
  }
}
