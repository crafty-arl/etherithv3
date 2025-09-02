-- Add Active Listening tables for enhanced cultural memory analysis
-- This migration extends the existing schema to support conversational AI interactions

-- User Queries with Active Listening Tracking
CREATE TABLE IF NOT EXISTS user_queries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  query_type TEXT NOT NULL DEFAULT 'memory_analysis',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'listening', 'analyzing', 'completed', 'failed'
  conversation_stage INTEGER DEFAULT 0, -- 0=initial, 1-3=active listening turns, 4=analysis complete
  emotional_context TEXT, -- JSON of detected emotions throughout conversation
  cultural_insights TEXT, -- JSON of cultural elements discovered during listening
  personal_details TEXT, -- JSON of personal context gathered through questions
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Active Listening Conversation Flow
CREATE TABLE IF NOT EXISTS active_listening_flow (
  id TEXT PRIMARY KEY,
  query_id TEXT NOT NULL REFERENCES user_queries(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  speaker TEXT NOT NULL, -- 'user' or 'ai'
  message_type TEXT NOT NULL, -- 'memory', 'question', 'answer', 'reflection', 'analysis'
  content TEXT NOT NULL,
  emotional_tone TEXT, -- AI's interpretation of emotional state
  cultural_cues TEXT, -- Cultural elements detected (JSON array)
  follow_up_reason TEXT, -- Why AI asked this specific question
  user_reaction TEXT, -- How user responded to AI's listening
  processing_time_ms INTEGER, -- Time taken to generate response
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- AI Analysis with Active Listening Context
CREATE TABLE IF NOT EXISTS ai_analysis_results (
  id TEXT PRIMARY KEY,
  query_id TEXT NOT NULL REFERENCES user_queries(id) ON DELETE CASCADE,
  ai_model TEXT NOT NULL DEFAULT '@cf/meta/llama-3.1-8b-instruct',
  analysis_data TEXT NOT NULL, -- Full analysis results as JSON
  active_listening_insights TEXT, -- What AI learned through listening process
  emotional_intelligence_score REAL, -- How well AI understood emotions (0-1)
  cultural_sensitivity_score REAL, -- Cultural understanding demonstrated (0-1)
  conversation_quality_score REAL, -- Overall conversation quality (0-1)
  confidence_score REAL, -- AI confidence in final analysis (0-1)
  processing_time_ms INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Conversation Quality Metrics
CREATE TABLE IF NOT EXISTS conversation_metrics (
  id TEXT PRIMARY KEY,
  query_id TEXT NOT NULL REFERENCES user_queries(id) ON DELETE CASCADE,
  total_turns INTEGER NOT NULL DEFAULT 0,
  user_engagement_score REAL, -- Based on response length and depth
  cultural_elements_discovered INTEGER DEFAULT 0,
  emotional_depth_achieved REAL, -- How deep the conversation went emotionally
  completion_status TEXT, -- 'completed', 'abandoned', 'interrupted'
  user_satisfaction_score REAL, -- If available from feedback
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_queries_user_id ON user_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_user_queries_status ON user_queries(status);
CREATE INDEX IF NOT EXISTS idx_user_queries_created_at ON user_queries(created_at);
CREATE INDEX IF NOT EXISTS idx_active_listening_flow_query_id ON active_listening_flow(query_id);
CREATE INDEX IF NOT EXISTS idx_active_listening_flow_turn_number ON active_listening_flow(turn_number);
CREATE INDEX IF NOT EXISTS idx_active_listening_flow_speaker ON active_listening_flow(speaker);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_results_query_id ON ai_analysis_results(query_id);
CREATE INDEX IF NOT EXISTS idx_conversation_metrics_query_id ON conversation_metrics(query_id);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_user_queries_timestamp 
  AFTER UPDATE ON user_queries
  BEGIN
    UPDATE user_queries SET updated_at = unixepoch() WHERE id = NEW.id;
  END;