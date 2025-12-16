-- CS2 Tournament Database Schema for Supabase
-- Run this SQL in the Supabase SQL Editor

-- Teams table
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    points INTEGER DEFAULT 0,
    image TEXT DEFAULT ''
);

-- Bracket matches table (stores all bracket data: quarterfinals, semifinals, finals)
CREATE TABLE bracket_matches (
    id VARCHAR(20) PRIMARY KEY,
    team1_id INTEGER REFERENCES teams(id),
    team2_id INTEGER REFERENCES teams(id)
);

-- Enable Row Level Security (RLS) - but allow all operations for simplicity
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE bracket_matches ENABLE ROW LEVEL SECURITY;

-- Allow all operations (public access for this simple app)
CREATE POLICY "Allow all on teams" ON teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on bracket_matches" ON bracket_matches FOR ALL USING (true) WITH CHECK (true);

-- Insert the 8 teams
INSERT INTO teams (id, name, points, image) VALUES
    (1, 'Team 1', 0, ''),
    (2, 'Team 2', 0, ''),
    (3, 'Team 3', 0, ''),
    (4, 'Team 4', 0, ''),
    (5, 'Team 5', 0, ''),
    (6, 'Team 6', 0, ''),
    (7, 'Team 7', 0, ''),
    (8, 'Team 8', 0, '');

-- Insert bracket match placeholders
INSERT INTO bracket_matches (id, team1_id, team2_id) VALUES
    ('qf1', NULL, NULL),
    ('qf2', NULL, NULL),
    ('qf3', NULL, NULL),
    ('qf4', NULL, NULL),
    ('sf1', NULL, NULL),
    ('sf2', NULL, NULL),
    ('final', NULL, NULL);

-- Reset the sequence to continue after id 8
SELECT setval('teams_id_seq', 8);
