# CS2 Tournament Website

A dynamic tournament website with Node.js backend for managing CS2 tournament brackets and scores.

## Installation

1. Install Node.js from [nodejs.org](https://nodejs.org/) if you haven't already
2. Open terminal in this directory
3. Install dependencies:
```bash
npm install
```

## Running the Server

Start the server with:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

## Using the Website

### Tournament Display Page
1. Start the server
2. Open your browser and go to `http://localhost:3000/index.html`
3. The page displays:
   - **Group Stage**: Bracket A and Bracket B with team standings
   - **Semi-Finals**: Automatically shows top 2 teams from each bracket, or manually selected teams from admin panel
   - **Finals**: Manually managed through the admin panel
4. The page will automatically refresh every 5 seconds to show updated scores
5. Teams with profile pictures will display their images next to their names

### Admin Panel
1. Open your browser and go to `http://localhost:3000/admin.html`
2. From the admin panel you can:
   - Change team names
   - Add or deduct points (use +1, +5, -1, -5 buttons or set directly)
   - Upload team profile pictures (click on the team image to upload)
   - **Manage semi-finals bracket** - Manually select teams for each semi-final match (or leave empty for automatic selection based on standings)
   - **Manage finals bracket** - Select which teams advance to the finals
   - Reset all points to 0
   - Reset semi-finals to automatic
   - Clear finals bracket
   - View the tournament page in a new tab
3. The admin panel auto-refreshes every 10 seconds

## API Endpoints

### Get All Tournament Data
```
GET /api/tournament
```
Returns all brackets and final placement.

### Get Bracket A
```
GET /api/bracket-a
```

### Get Bracket B
```
GET /api/bracket-b
```

### Get Final Placement
```
GET /api/placement
```

### Update Team Points
```
PUT /api/team/:id
Content-Type: application/json

{
  "points": 10
}
```

Example using curl:
```bash
curl -X PUT http://localhost:3000/api/team/1 -H "Content-Type: application/json" -d "{\"points\": 10}"
```

### Update Team Name
```
PUT /api/team/:id/name
Content-Type: application/json

{
  "name": "New Team Name"
}
```

Example using curl:
```bash
curl -X PUT http://localhost:3000/api/team/1/name -H "Content-Type: application/json" -d "{\"name\": \"Winners\"}"
```

### Reset All Points
```
POST /api/reset
```

Example using curl:
```bash
curl -X POST http://localhost:3000/api/reset
```

### Upload Team Image
```
POST /api/team/:id/image
Content-Type: multipart/form-data

Form field: image (file)
```

Example using curl:
```bash
curl -X POST http://localhost:3000/api/team/1/image -F "image=@path/to/image.jpg"
```

Supported formats: JPEG, JPG, PNG, GIF (max 5MB)

### Get Finals
```
GET /api/finals
```
Returns the current finals bracket teams.

### Update Finals
```
PUT /api/finals
Content-Type: application/json

{
  "team1Id": 1,
  "team2Id": 5
}
```

Example using curl:
```bash
curl -X PUT http://localhost:3000/api/finals -H "Content-Type: application/json" -d "{\"team1Id\": 1, \"team2Id\": 5}"
```

### Reset Finals
```
POST /api/finals/reset
```

Example using curl:
```bash
curl -X POST http://localhost:3000/api/finals/reset
```

### Get Semi-Finals
```
GET /api/semifinals
```
Returns the current semi-finals bracket teams.

### Update Semi-Finals
```
PUT /api/semifinals
Content-Type: application/json

{
  "match1Team1Id": 1,
  "match1Team2Id": 6,
  "match2Team1Id": 7,
  "match2Team2Id": 2
}
```

Example using curl:
```bash
curl -X PUT http://localhost:3000/api/semifinals -H "Content-Type: application/json" -d "{\"match1Team1Id\": 1, \"match1Team2Id\": 6, \"match2Team1Id\": 7, \"match2Team2Id\": 2}"
```

Note: Leave any team ID as `null` or empty to use automatic selection for that position.

### Reset Semi-Finals
```
POST /api/semifinals/reset
```
Resets semi-finals to automatic selection based on group standings.

Example using curl:
```bash
curl -X POST http://localhost:3000/api/semifinals/reset
```

## Team IDs

- Bracket A: IDs 1-4
- Bracket B: IDs 5-8

## Files

- `index.html` - Tournament website frontend (public display)
- `admin.html` - Admin panel for managing tournament
- `server.js` - Node.js Express server with REST API
- `tournament-data.json` - Tournament data storage (teams, points, images)
- `package.json` - Node.js dependencies
- `uploads/` - Directory for team profile pictures

## Example: Updating Scores

To update a team's score using PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/team/1" -Method PUT -Headers @{"Content-Type"="application/json"} -Body '{"points": 15}'
```

Or using JavaScript in browser console:
```javascript
fetch('http://localhost:3000/api/team/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ points: 15 })
})
```
