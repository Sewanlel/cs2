const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'tournament-data.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        const teamId = req.params.id;
        const ext = path.extname(file.originalname);
        cb(null, `team-${teamId}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Initialize data file if it doesn't exist
function initializeData() {
    if (!fs.existsSync(DATA_FILE)) {
        const initialData = {
            teams: [
                { id: 1, name: 'Team 1', points: 0, image: '' },
                { id: 2, name: 'Team 2', points: 0, image: '' },
                { id: 3, name: 'Team 3', points: 0, image: '' },
                { id: 4, name: 'Team 4', points: 0, image: '' },
                { id: 5, name: 'Team 5', points: 0, image: '' },
                { id: 6, name: 'Team 6', points: 0, image: '' },
                { id: 7, name: 'Team 7', points: 0, image: '' },
                { id: 8, name: 'Team 8', points: 0, image: '' }
            ],
            quarterfinals: {
                match1: { team1: null, team2: null },
                match2: { team1: null, team2: null },
                match3: { team1: null, team2: null },
                match4: { team1: null, team2: null }
            },
            semifinals: {
                match1: { team1: null, team2: null },
                match2: { team1: null, team2: null }
            },
            finals: {
                team1: null,
                team2: null
            }
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    }
}

// Read data from file
function readData() {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
}

// Write data to file
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Routes
// Get all tournament data
app.get('/api/tournament', (req, res) => {
    try {
        const data = readData();
        res.json({
            teams: data.teams,
            quarterfinals: data.quarterfinals || {},
            semifinals: data.semifinals || {},
            finals: data.finals || { team1: null, team2: null }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to read tournament data' });
    }
});

// Get teams
app.get('/api/teams', (req, res) => {
    try {
        const data = readData();
        res.json(data.teams);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read teams data' });
    }
});

// Update team points
app.put('/api/team/:id', (req, res) => {
    try {
        const teamId = parseInt(req.params.id);
        const { points } = req.body;

        if (typeof points !== 'number') {
            return res.status(400).json({ error: 'Points must be a number' });
        }

        const data = readData();
        const teamIndex = data.teams.findIndex(t => t.id === teamId);

        if (teamIndex === -1) {
            return res.status(404).json({ error: 'Team not found' });
        }

        data.teams[teamIndex].points = points;
        writeData(data);
        res.json({ message: 'Team points updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update team points' });
    }
});

// Update team name
app.put('/api/team/:id/name', (req, res) => {
    try {
        const teamId = parseInt(req.params.id);
        const { name } = req.body;

        if (!name || typeof name !== 'string') {
            return res.status(400).json({ error: 'Name must be a non-empty string' });
        }

        const data = readData();
        const teamIndex = data.teams.findIndex(t => t.id === teamId);

        if (teamIndex === -1) {
            return res.status(404).json({ error: 'Team not found' });
        }

        data.teams[teamIndex].name = name;
        writeData(data);
        res.json({ message: 'Team name updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update team name' });
    }
});

// Upload team image
app.post('/api/team/:id/image', upload.single('image'), (req, res) => {
    try {
        const teamId = parseInt(req.params.id);

        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Read the image file and convert to base64
        const imageBuffer = fs.readFileSync(req.file.path);
        const base64Image = `data:${req.file.mimetype};base64,${imageBuffer.toString('base64')}`;

        const data = readData();
        const teamIndex = data.teams.findIndex(t => t.id === teamId);

        if (teamIndex === -1) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: 'Team not found' });
        }

        // Store base64 image in JSON
        data.teams[teamIndex].image = base64Image;
        writeData(data);

        // Delete the temporary uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            message: 'Team image updated successfully',
            imageUrl: base64Image
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Reset all points
app.post('/api/reset', (req, res) => {
    try {
        const data = readData();
        data.teams = data.teams.map(team => ({ ...team, points: 0 }));
        writeData(data);
        res.json({ message: 'All points reset successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset points' });
    }
});

// Get quarterfinals
app.get('/api/quarterfinals', (req, res) => {
    try {
        const data = readData();
        res.json(data.quarterfinals || {});
    } catch (error) {
        res.status(500).json({ error: 'Failed to read quarterfinals data' });
    }
});

// Update quarterfinals
app.put('/api/quarterfinals', (req, res) => {
    try {
        const { match1Team1Id, match1Team2Id, match2Team1Id, match2Team2Id, match3Team1Id, match3Team2Id, match4Team1Id, match4Team2Id } = req.body;

        const data = readData();
        const getTeam = (teamId) => {
            if (!teamId) return null;
            const team = data.teams.find(t => t.id === parseInt(teamId));
            return team ? { id: team.id, name: team.name, points: team.points, image: team.image } : null;
        };

        data.quarterfinals = {
            match1: { team1: getTeam(match1Team1Id), team2: getTeam(match1Team2Id) },
            match2: { team1: getTeam(match2Team1Id), team2: getTeam(match2Team2Id) },
            match3: { team1: getTeam(match3Team1Id), team2: getTeam(match3Team2Id) },
            match4: { team1: getTeam(match4Team1Id), team2: getTeam(match4Team2Id) }
        };

        writeData(data);
        res.json({ message: 'Quarterfinals updated successfully', quarterfinals: data.quarterfinals });
    } catch (error) {
        console.error('Error updating quarterfinals:', error);
        res.status(500).json({ error: 'Failed to update quarterfinals' });
    }
});

// Reset quarterfinals
app.post('/api/quarterfinals/reset', (req, res) => {
    try {
        const data = readData();
        data.quarterfinals = {
            match1: { team1: null, team2: null },
            match2: { team1: null, team2: null },
            match3: { team1: null, team2: null },
            match4: { team1: null, team2: null }
        };
        writeData(data);
        res.json({ message: 'Quarterfinals reset successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset quarterfinals' });
    }
});

// Get semifinals
app.get('/api/semifinals', (req, res) => {
    try {
        const data = readData();
        res.json(data.semifinals || { match1: { team1: null, team2: null }, match2: { team1: null, team2: null } });
    } catch (error) {
        res.status(500).json({ error: 'Failed to read semifinals data' });
    }
});

// Update semifinals
app.put('/api/semifinals', (req, res) => {
    try {
        const { match1Team1Id, match1Team2Id, match2Team1Id, match2Team2Id } = req.body;

        const data = readData();
        const getTeam = (teamId) => {
            if (!teamId) return null;
            const team = data.teams.find(t => t.id === parseInt(teamId));
            return team ? { id: team.id, name: team.name, points: team.points, image: team.image } : null;
        };

        data.semifinals = {
            match1: { team1: getTeam(match1Team1Id), team2: getTeam(match1Team2Id) },
            match2: { team1: getTeam(match2Team1Id), team2: getTeam(match2Team2Id) }
        };

        writeData(data);
        res.json({ message: 'Semifinals updated successfully', semifinals: data.semifinals });
    } catch (error) {
        console.error('Error updating semifinals:', error);
        res.status(500).json({ error: 'Failed to update semifinals' });
    }
});

// Reset semifinals
app.post('/api/semifinals/reset', (req, res) => {
    try {
        const data = readData();
        data.semifinals = {
            match1: { team1: null, team2: null },
            match2: { team1: null, team2: null }
        };
        writeData(data);
        res.json({ message: 'Semifinals reset successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset semifinals' });
    }
});

// Get finals
app.get('/api/finals', (req, res) => {
    try {
        const data = readData();
        res.json(data.finals || { team1: null, team2: null });
    } catch (error) {
        res.status(500).json({ error: 'Failed to read finals data' });
    }
});

// Update finals
app.put('/api/finals', (req, res) => {
    try {
        const { team1Id, team2Id } = req.body;

        const data = readData();
        const getTeam = (teamId) => {
            if (!teamId) return null;
            const team = data.teams.find(t => t.id === parseInt(teamId));
            return team ? { id: team.id, name: team.name, points: team.points, image: team.image } : null;
        };

        data.finals = {
            team1: getTeam(team1Id),
            team2: getTeam(team2Id)
        };

        writeData(data);
        res.json({ message: 'Finals updated successfully', finals: data.finals });
    } catch (error) {
        console.error('Error updating finals:', error);
        res.status(500).json({ error: 'Failed to update finals' });
    }
});

// Reset finals
app.post('/api/finals/reset', (req, res) => {
    try {
        const data = readData();
        data.finals = { team1: null, team2: null };
        writeData(data);
        res.json({ message: 'Finals reset successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset finals' });
    }
});

// Initialize data and start server
initializeData();

app.listen(PORT, () => {
    console.log(`CS2 Tournament Server is running on http://localhost:${PORT}`);
    console.log(`Tournament Page: http://localhost:${PORT}/index.html`);
    console.log(`Admin Panel: http://localhost:${PORT}/admin.html`);
});
