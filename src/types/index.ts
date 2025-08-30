export interface User {
  id: string
  email: string
  username: string
  fullName: string
  avatarUrl?: string
  bio?: string
  culturalBackground: string[]
  dateOfBirth?: Date
  location?: {
    country: string
    region?: string
    city?: string
    coordinates?: [number, number]
  }
  isVerified: boolean
  verificationLevel: number
  createdAt: Date
  updatedAt: Date
}

export interface Memory {
  id: string
  userId: string
  title: string
  description?: string
  contentType: 'image' | 'video' | 'audio' | 'document'
  ipfsHash: string
  ipfsGatewayUrl?: string
  fileSize?: number
  mimeType?: string
  culturalContext: string[]
  culturalSignificanceScore?: number
  tags: string[]
  isPublic: boolean
  accessLevel: 'public' | 'community' | 'private'
  createdAt: Date
  updatedAt: Date
}

export interface CulturalCommunity {
  id: string
  name: string
  description?: string
  culturalFocus: string[]
  location?: any
  memberCount: number
  isVerified: boolean
  verificationLevel: number
  createdAt: Date
  updatedAt: Date
}
