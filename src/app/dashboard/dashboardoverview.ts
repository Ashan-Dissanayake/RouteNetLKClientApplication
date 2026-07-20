/**
 * Interface representing the comprehensive real-time dashboard metrics
 * for an individual SLTB depot branch context.
 */
export interface DashboardOverview {
  activeTripsCount: number;
  pendingIncidentsCount: number;

  // Shift coverage percentages and breakdown status tracking
  shiftCoveragePercentage: number;
  assignedDriversCount: number;
  assignedConductorsCount: number;

  // High-level operational summaries for the active scheduling day
  totalScheduledTrips: number;
  completedTripsCount: number;
  delayedTripsCount: number;
  breakdownCount: number;
}
