# Core Data Directory

This directory contains static data files used by the maneuver-core framework.

## Events Data

### Purpose

The `events_YYYY.json` files contain official FRC event listings for each competition season. These are used by the EventNameSelector component to provide quick event selection with proper TBA (The Blue Alliance) event keys.

### File Format

**Filename:** `events_YYYY.json` (e.g., `events_2026.json`, `events_2027.json`)

**Structure:**

```json
[
  {
    "name": "Event Name",
    "key": "YYYYcode",
    "week": 0-6 | null
  }
]
```

**Fields:**

- `name` (string): Full official event name (e.g., "Rocket City Regional")
- `key` (string): TBA event key (e.g., "2026alhu")
- `week` (number | null): Competition week (0-6), or `null` for Championship divisions

### Generating Events Data

#### Option 1: Using Maneuver Event Fetcher (RECOMMENDED)

**Official utility repository:**  
<https://github.com/ShinyShips/Maneuver-utilities/tree/main/event_fetcher>

This is the recommended method as it's specifically designed for Maneuver and outputs the exact format needed.

**Setup:**

```bash
# Clone or download the utility
git clone https://github.com/ShinyShips/Maneuver-utilities.git
cd Maneuver-utilities/event_fetcher

# Install dependencies
pip install -r requirements.txt

# Get TBA API key from https://www.thebluealliance.com/account
# Set as environment variable
export TBA_API_KEY="your_api_key_here"  # Linux/Mac
set TBA_API_KEY=your_api_key_here       # Windows CMD
$env:TBA_API_KEY="your_api_key_here"    # Windows PowerShell
```

**Usage:**

```bash
# Generate events for a year (displays to console)
python get_events.py 2027

# Generate and save to JSON file
python get_events.py 2027 --save

# Specify custom output filename
python get_events.py 2027 --save --output events_2027.json

# Pass API key directly (alternative to environment variable)
python get_events.py 2027 --save --api-key your_api_key_here
```

The utility will create a JSON file in the correct format:

```json
[
  {
    "name": "Rocket City Regional",
    "key": "2027alhu",
    "week": 5
  }
]
```

**Then:**

1. Move the generated `events_2027.json` to `src/core/data/`
2. Update `EventNameSelector.tsx` import path
3. Done!

#### Option 2: Manual from TBA Website

1. Visit [The Blue Alliance](https://www.thebluealliance.com/events)
2. Select the desired year
3. Copy event names, keys, and weeks into JSON format

#### Option 3: Using TBA API (Custom Script)

Use a custom script if you need special filtering or formatting:

```javascript
// Example fetch script
const YEAR = 2027;
const TBA_KEY = 'your_tba_api_key';

fetch(`https://www.thebluealliance.com/api/v3/events/${YEAR}`, {
  headers: { 'X-TBA-Auth-Key': TBA_KEY }
})
  .then(res => res.json())
  .then(events => {
    const formatted = events.map(e => ({
      name: e.name,
      key: e.key,
      week: e.week
    }));
    console.log(JSON.stringify(formatted, null, 2));
  });
```

#### Option 3: Using Python

```python
import requests
import json

YEAR = 2027
TBA_KEY = 'your_tba_api_key'

response = requests.get(
    f'https://www.thebluealliance.com/api/v3/events/{YEAR}',
    headers={'X-TBA-Auth-Key': TBA_KEY}
)

events = response.json()
formatted = [
    {
        'name': event['name'],
        'key': event['key'],
        'week': event.get('week')
    }
    for event in events
]

with open(f'events_{YEAR}.json', 'w', encoding='utf-8') as f:
    json.dump(formatted, f, indent=2, ensure_ascii=False)
```

### Updating for a New Season

1. **Generate the events JSON** using one of the methods above
2. **Save the file** as `events_YYYY.json` in this directory
3. **Update EventNameSelector.tsx:**
   - Update the import path: `import eventsYYYY from "@/core/data/events_YYYY.json"`
   - Update the interface name if desired (optional)
   - Update the variable name: `const officialEvents = eventsYYYY as EventYYYY[]`
4. **Test** by selecting events in the GameStartPage

### Notes

- Championship divisions (Archimedes, Curie, etc.) should have `week: null`
- Event keys follow TBA format: `YYYYcode` (e.g., "2026alhu", "2027casd")
- Week numbers range from 0 (earliest events) to 6 (typically state championships)
- The JSON should be sorted alphabetically by name for better searchability
- Use UTF-8 encoding to support international event names (Turkish, Brazilian, etc.)

### Current Files

- `events_2026.json` - 2026 FRC competition season (400+ events)

### Related Components

- `src/core/components/GameStartComponents/EventNameSelector.tsx` - Uses this data for event selection
- `src/types/scouting-entry.ts` - `eventKey` field expects keys from this data
- `src/core/db/database.ts` - Indexes entries by `eventKey`
