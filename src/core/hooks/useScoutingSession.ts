import { useLocation } from 'react-router-dom';

/**
 * Hook to detect if user is currently in the middle of a scouting session
 * Returns true if on any page that contains scouting data that would be lost
 */
export function useScoutingSession() {
  const location = useLocation();
  
  // Define routes that are considered "middle of scouting" where data loss would occur
  const scoutingRoutes = [
    '/auto-start',
    '/auto-scoring', 
    '/teleop-scoring',
    '/endgame'
  ];
  
  const isInScoutingSession = scoutingRoutes.includes(location.pathname);
  
  // Check if there's any scouting data in localStorage that would be lost
  const hasScoutingData = () => {
    try {
      const autoData = localStorage.getItem('autoStateStack');
      const teleopData = localStorage.getItem('teleopStateStack');
      
      const autoActions = autoData ? JSON.parse(autoData) : [];
      const teleopActions = teleopData ? JSON.parse(teleopData) : [];
      
      // Also check if we have location state that indicates active scouting
      const hasLocationState = location.state && 
        location.state.inputs && 
        (location.state.inputs.matchNumber || location.state.inputs.selectTeam);
      
      return autoActions.length > 0 || 
             teleopActions.length > 0 || 
             (isInScoutingSession && hasLocationState);
    } catch {
      // If there's an error parsing, still consider it as having data if in scouting session
      return isInScoutingSession;
    }
  };
  
  return {
    isInScoutingSession,
    hasUnsavedData: isInScoutingSession && hasScoutingData()
  };
}
