import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  fullName: text('full_name').notNull(),
  password: text('password'), // For credentials provider
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  discordId: text('discord_id').unique(),
  culturalBackground: text('cultural_background'), // JSON string
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false),
  verificationLevel: integer('verification_level').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

// Sessions table for NextAuth
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
  sessionToken: text('session_token').notNull().unique(),
})

// Accounts table for OAuth providers
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
})

// Verification tokens table for NextAuth
export const verificationTokens = sqliteTable('verification_tokens', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
})

// User Queries with Active Listening Tracking
export const userQueries = sqliteTable('user_queries', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  queryText: text('query_text').notNull(),
  queryType: text('query_type').notNull().default('memory_analysis'),
  status: text('status').notNull().default('pending'),
  conversationStage: integer('conversation_stage').default(0),
  emotionalContext: text('emotional_context'),
  culturalInsights: text('cultural_insights'),
  personalDetails: text('personal_details'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// Active Listening Conversation Flow
export const activeListeningFlow = sqliteTable('active_listening_flow', {
  id: text('id').primaryKey(),
  queryId: text('query_id').notNull().references(() => userQueries.id, { onDelete: 'cascade' }),
  turnNumber: integer('turn_number').notNull(),
  speaker: text('speaker').notNull(),
  messageType: text('message_type').notNull(),
  content: text('content').notNull(),
  emotionalTone: text('emotional_tone'),
  culturalCues: text('cultural_cues'),
  followUpReason: text('follow_up_reason'),
  userReaction: text('user_reaction'),
  processingTimeMs: integer('processing_time_ms'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// AI Analysis with Active Listening Context
export const aiAnalysisResults = sqliteTable('ai_analysis_results', {
  id: text('id').primaryKey(),
  queryId: text('query_id').notNull().references(() => userQueries.id, { onDelete: 'cascade' }),
  aiModel: text('ai_model').notNull().default('@cf/meta/llama-3.1-8b-instruct'),
  analysisData: text('analysis_data').notNull(),
  activeListeningInsights: text('active_listening_insights'),
  emotionalIntelligenceScore: real('emotional_intelligence_score'),
  culturalSensitivityScore: real('cultural_sensitivity_score'),
  conversationQualityScore: real('conversation_quality_score'),
  confidenceScore: real('confidence_score'),
  processingTimeMs: integer('processing_time_ms'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// Conversation Quality Metrics
export const conversationMetrics = sqliteTable('conversation_metrics', {
  id: text('id').primaryKey(),
  queryId: text('query_id').notNull().references(() => userQueries.id, { onDelete: 'cascade' }),
  totalTurns: integer('total_turns').notNull().default(0),
  userEngagementScore: real('user_engagement_score'),
  culturalElementsDiscovered: integer('cultural_elements_discovered').default(0),
  emotionalDepthAchieved: real('emotional_depth_achieved'),
  completionStatus: text('completion_status'),
  userSatisfactionScore: real('user_satisfaction_score'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

// Add relations for new tables
export const userQueriesRelations = relations(userQueries, ({ many, one }) => ({
  activeListeningFlow: many(activeListeningFlow),
  aiAnalysisResults: many(aiAnalysisResults),
  conversationMetrics: many(conversationMetrics),
  user: one(users, {
    fields: [userQueries.userId],
    references: [users.id],
  }),
}))

export const activeListeningFlowRelations = relations(activeListeningFlow, ({ one }) => ({
  userQuery: one(userQueries, {
    fields: [activeListeningFlow.queryId],
    references: [userQueries.id],
  }),
}))

export const aiAnalysisResultsRelations = relations(aiAnalysisResults, ({ one }) => ({
  userQuery: one(userQueries, {
    fields: [aiAnalysisResults.queryId],
    references: [userQueries.id],
  }),
}))

export const conversationMetricsRelations = relations(conversationMetrics, ({ one }) => ({
  userQuery: one(userQueries, {
    fields: [conversationMetrics.queryId],
    references: [userQueries.id],
  }),
}))

// Type exports for TypeScript
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Session = typeof sessions.$inferSelect
export type Account = typeof accounts.$inferSelect
export type UserQuery = typeof userQueries.$inferSelect
export type NewUserQuery = typeof userQueries.$inferInsert
export type ActiveListeningTurn = typeof activeListeningFlow.$inferSelect
export type NewActiveListeningTurn = typeof activeListeningFlow.$inferInsert
export type AIAnalysisResult = typeof aiAnalysisResults.$inferSelect
export type NewAIAnalysisResult = typeof aiAnalysisResults.$inferInsert
export type ConversationMetric = typeof conversationMetrics.$inferSelect
export type NewConversationMetric = typeof conversationMetrics.$inferInsert