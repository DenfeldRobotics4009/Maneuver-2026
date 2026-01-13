import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { AlertCircle, ClipboardList } from 'lucide-react';
import { Alert, AlertDescription } from "@/core/components/ui/alert";

interface EventInformationCardProps {
  selectedEvent: string;
  teamDataSource: 'nexus' | 'tba' | null;
  currentTeams: number[];
  pitAddresses: { [teamNumber: string]: string } | null;
  hasTeamData: boolean;
}

const EventInformationCard: React.FC<EventInformationCardProps> = ({
  selectedEvent,
  teamDataSource,
  currentTeams,
  pitAddresses,
  hasTeamData,
}) => {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Event Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasTeamData ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No team data found. Please import team lists from the TBA Data page or load demo data from the home page.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Event:</span>
                <span className="text-lg font-semibold text-primary">{selectedEvent}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Teams to Scout:</span>
                <span className="text-lg font-semibold">{currentTeams.length}</span>
              </div>
              {pitAddresses && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">With Pit Locations:</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {Object.keys(pitAddresses).length} teams
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Data Source:</span>
                <span className="text-sm font-medium capitalize">
                  {teamDataSource === 'nexus' ? (
                    <span className="text-blue-600 flex items-center gap-1">
                      <span>Nexus</span>
                      <span className="text-xs text-muted-foreground">(with pit locations)</span>
                    </span>
                  ) : (
                    <span className="text-orange-600">TBA</span>
                  )}
                </span>
              </div>
              <div className="text-xs text-muted-foreground pt-2 border-t">
                {teamDataSource === 'nexus' 
                  ? 'Teams extracted from Nexus pit addresses. Pit locations available for enhanced assignments.'
                  : 'Teams imported from The Blue Alliance. Import new data on the TBA Data page to change events.'
                }
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventInformationCard;
