import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { convertTeamRole } from "@/core/lib/utils";

interface DeviceInfoCardProps {
  playerStation: string;
}

export const DeviceInfoCard = ({ playerStation }: DeviceInfoCardProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Device Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">
          <span className="font-medium">Player Station:</span> {convertTeamRole(playerStation)}
        </p>
        <p className="text-sm">
          <span className="font-medium">Last Updated:</span> {new Date().toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
};
