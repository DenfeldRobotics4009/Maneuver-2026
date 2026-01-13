import { cn } from "@/core/lib/utils";

interface AutoStartMapProps {
  startPosition: (boolean | null)[];
  setStartPosition: React.Dispatch<React.SetStateAction<boolean | null>>[];
  alliance: string;
}

const AutoStartMap = ({ startPosition, setStartPosition, alliance }: AutoStartMapProps) => {
  const handlePositionClick = (index: number) => {
    // Clear all positions first
    setStartPosition.forEach((setter) => setter(false));
    // Set the clicked position to true
    if (setStartPosition[index]) {
      setStartPosition[index](true);
    }
  };

  const isRed = alliance === "red";

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      {/* Placeholder field - game implementations should replace this with actual field image/SVG */}
      <div className="w-full h-full relative border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center">
        {/* Grid of 6 starting positions (2 rows x 3 columns) */}
        <div className="grid grid-cols-3 gap-4 p-8">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <button
              key={index}
              onClick={() => handlePositionClick(index)}
              className={cn(
                "w-24 h-24 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all hover:scale-105",
                startPosition[index]
                  ? isRed
                    ? "bg-red-500 text-white border-red-700 shadow-lg"
                    : "bg-blue-500 text-white border-blue-700 shadow-lg"
                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-gray-400"
              )}
            >
              {index + 1}
            </button>
          ))}
        </div>
        
        {/* Placeholder text */}
        <div className="absolute top-4 left-4 text-sm text-muted-foreground bg-white/90 dark:bg-gray-900/90 p-2 rounded">
          Game Implementation: Replace with field image
        </div>
      </div>
    </div>
  );
};

export default AutoStartMap;
