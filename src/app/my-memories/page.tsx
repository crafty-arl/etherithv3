'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Sparkles, 
  Search, 
  Globe, 
  Heart, 
  Users, 
  Archive, 
  Star, 
  MapPin, 
  Calendar, 
  Grid,
  List,
  Edit3,
  Trash2,
  Share2,
  Download,
  Eye,
  Lock,
  Unlock,
  Bookmark,
  Clock,
  Tag,
  Camera,
  Music,
  Film,
  FileText,
  Plus,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import Link from 'next/link';

interface PersonalMemory {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  location: string;
  date: string;
  culturalContext: string;
  familyMembers: string[];
  emotionalSignificance: string;
  mediaFiles: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    thumbnail?: string;
  }>;
  isPublic: boolean;
  isShared: boolean;
  isBookmarked: boolean;
  createdAt: Date;
  lastModified: Date;
  viewCount: number;
  shareCount: number;
}

export default function MyMemoriesPage() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<PersonalMemory[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<PersonalMemory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'name' | 'location'>('recent');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading personal memories
  useEffect(() => {
    const loadMemories = async () => {
      setTimeout(() => {
        const mockMemories: PersonalMemory[] = [
          {
            id: '1',
            title: 'Grandmother\'s Traditional Bread Recipe',
            description: 'The secret family recipe passed down through generations',
            category: 'Family',
            tags: ['recipe', 'bread', 'tradition', 'family'],
            location: 'Grandmother\'s Kitchen, Sicily',
            date: '1950-03-15',
            culturalContext: 'Traditional Sicilian baking methods',
            familyMembers: ['Grandmother Maria', 'Mother Lucia'],
            emotionalSignificance: 'Represents the love and care passed through generations',
            mediaFiles: [
              { id: '1-1', name: 'bread_photo.jpg', type: 'image', size: 2048000, url: '/api/memories/1-1', thumbnail: '/api/memories/1-1/thumb' },
              { id: '1-2', name: 'recipe_audio.m4a', type: 'audio', size: 5120000, url: '/api/memories/1-2' }
            ],
            isPublic: false,
            isShared: false,
            isBookmarked: true,
            createdAt: new Date('2024-01-15'),
            lastModified: new Date('2024-01-20'),
            viewCount: 12,
            shareCount: 0
          },
          {
            id: '2',
            title: 'Family Migration Journey',
            description: 'The story of our family\'s journey from Italy to America',
            category: 'Historical',
            tags: ['migration', 'family', 'history', 'journey'],
            location: 'Ellis Island, New York',
            date: '1920-06-20',
            culturalContext: 'Italian immigration to America in the 1920s',
            familyMembers: ['Great-Grandfather Giuseppe', 'Great-Grandmother Rosa'],
            emotionalSignificance: 'Foundation of our family\'s American story',
            mediaFiles: [
              { id: '2-1', name: 'ellis_island.jpg', type: 'image', size: 3072000, url: '/api/memories/2-1', thumbnail: '/api/memories/2-1/thumb' },
              { id: '2-2', name: 'ship_document.pdf', type: 'document', size: 1024000, url: '/api/memories/2-2' }
            ],
            isPublic: true,
            isShared: true,
            isBookmarked: false,
            createdAt: new Date('2024-01-20'),
            lastModified: new Date('2024-01-25'),
            viewCount: 45,
            shareCount: 8
          },
          {
            id: '3',
            title: 'Cultural Festival Celebration',
            description: 'Annual celebration of our heritage and traditions',
            category: 'Cultural',
            tags: ['festival', 'celebration', 'heritage', 'community'],
            location: 'Little Italy, New York',
            date: '2023-09-15',
            culturalContext: 'Italian-American cultural preservation',
            familyMembers: ['Uncle Marco', 'Cousin Sofia', 'Aunt Isabella'],
            emotionalSignificance: 'Joy of celebrating our roots together',
            mediaFiles: [
              { id: '3-1', name: 'festival_video.mp4', type: 'video', size: 25600000, url: '/api/memories/3-1', thumbnail: '/api/memories/3-1/thumb' },
              { id: '3-2', name: 'dance_photo.jpg', type: 'image', size: 1536000, url: '/api/memories/3-2', thumbnail: '/api/memories/3-2/thumb' },
              { id: '3-3', name: 'music_recording.m4a', type: 'audio', size: 8192000, url: '/api/memories/3-3' }
            ],
            isPublic: true,
            isShared: false,
            isBookmarked: true,
            createdAt: new Date('2024-01-25'),
            lastModified: new Date('2024-01-30'),
            viewCount: 78,
            shareCount: 15
          },
          {
            id: '4',
            title: 'Childhood Summer Memories',
            description: 'Warm summer days spent with family in the countryside',
            category: 'Personal',
            tags: ['childhood', 'summer', 'family', 'nature'],
            location: 'Family Farm, Tuscany',
            date: '1995-07-15',
            culturalContext: 'Rural Italian family traditions',
            familyMembers: ['Father Antonio', 'Sister Elena', 'Cousin Luca'],
            emotionalSignificance: 'Innocence and wonder of childhood',
            mediaFiles: [
              { id: '4-1', name: 'summer_photo.jpg', type: 'image', size: 2048000, url: '/api/memories/4-1', thumbnail: '/api/memories/4-1/thumb' },
              { id: '4-2', name: 'cricket_sounds.m4a', type: 'audio', size: 4096000, url: '/api/memories/4-2' }
            ],
            isPublic: false,
            isShared: false,
            isBookmarked: false,
            createdAt: new Date('2024-02-01'),
            lastModified: new Date('2024-02-01'),
            viewCount: 5,
            shareCount: 0
          }
        ];
        setMemories(mockMemories);
        setFilteredMemories(mockMemories);
        setIsLoading(false);
      }, 1000);
    };

    loadMemories();
  }, []);

  // Filter memories based on search, category, and status
  useEffect(() => {
    let filtered = memories;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(memory => memory.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(memory => {
        if (selectedStatus === 'public') return memory.isPublic;
        if (selectedStatus === 'private') return !memory.isPublic;
        if (selectedStatus === 'shared') return memory.isShared;
        if (selectedStatus === 'bookmarked') return memory.isBookmarked;
        return true;
      });
    }

    if (searchQuery) {
      filtered = filtered.filter(memory =>
        memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        memory.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort memories
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        case 'location':
          return a.location.localeCompare(b.location);
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredMemories(filtered);
  }, [memories, searchQuery, selectedCategory, selectedStatus, sortBy]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Family':
        return <Heart className="w-5 h-5" />;
      case 'Cultural':
        return <Globe className="w-5 h-5" />;
      case 'Personal':
        return <Users className="w-5 h-5" />;
      case 'Historical':
        return <Archive className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Family':
        return 'from-pink-500 to-rose-500';
      case 'Cultural':
        return 'from-blue-500 to-indigo-500';
      case 'Personal':
        return 'from-green-500 to-emerald-500';
      case 'Historical':
        return 'from-amber-500 to-orange-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Camera className="w-4 h-4" />;
      case 'video':
        return <Film className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const categories = [
    { id: 'all', name: 'All Categories', icon: <Sparkles className="w-4 h-4" />, count: memories.length },
    { id: 'Family', name: 'Family', icon: <Heart className="w-4 h-4" />, count: memories.filter(m => m.category === 'Family').length },
    { id: 'Cultural', name: 'Cultural', icon: <Globe className="w-4 h-4" />, count: memories.filter(m => m.category === 'Cultural').length },
    { id: 'Personal', name: 'Personal', icon: <Users className="w-4 h-4" />, count: memories.filter(m => m.category === 'Personal').length },
    { id: 'Historical', name: 'Historical', icon: <Archive className="w-4 h-4" />, count: memories.filter(m => m.category === 'Historical').length }
  ];

  const statuses = [
    { id: 'all', name: 'All Status', icon: <Eye className="w-4 h-4" />, count: memories.length },
    { id: 'public', name: 'Public', icon: <Unlock className="w-4 h-4" />, count: memories.filter(m => m.isPublic).length },
    { id: 'private', name: 'Private', icon: <Lock className="w-4 h-4" />, count: memories.filter(m => !m.isPublic).length },
    { id: 'shared', name: 'Shared', icon: <Share2 className="w-4 h-4" />, count: memories.filter(m => m.isShared).length },
    { id: 'bookmarked', name: 'Bookmarked', icon: <Bookmark className="w-4 h-4" />, count: memories.filter(m => m.isBookmarked).length }
  ];

  const sortOptions = [
    { id: 'recent', name: 'Most Recent', icon: <Clock className="w-4 h-4" /> },
    { id: 'oldest', name: 'Oldest First', icon: <Calendar className="w-4 h-4" /> },
    { id: 'name', name: 'Alphabetical', icon: <Tag className="w-4 h-4" /> },
    { id: 'location', name: 'By Location', icon: <MapPin className="w-4 h-4" /> }
  ];

  const toggleMemoryStatus = (memoryId: string, status: 'public' | 'bookmarked') => {
    setMemories(prev => prev.map(memory => 
      memory.id === memoryId 
        ? { ...memory, [status === 'public' ? 'isPublic' : 'isBookmarked']: !memory[status === 'public' ? 'isPublic' : 'isBookmarked'] }
        : memory
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{
             background: 'linear-gradient(135deg, #f8f7f5 0%, #ffffff 30%, #f5f4f2 70%, #e8e6e3 100%)'
           }}>
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <FolderOpen className="w-10 h-10 text-amber-500 animate-bounce" />
            </div>
          </div>
          <p className="text-stone-600 text-lg font-medium">Loading your memories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen"
         style={{
           background: 'linear-gradient(135deg, #f8f7f5 0%, #ffffff 30%, #f5f4f2 70%, #e8e6e3 100%)'
         }}>
      {/* Header */}
      <div className="sticky top-0 z-50"
           style={{
             background: 'rgba(255, 255, 255, 0.95)',
             backdropFilter: 'blur(20px) saturate(180%)',
             boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
             borderBottom: '1px solid rgba(255, 255, 255, 0.3)'
           }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/" className="flex items-center space-x-1 sm:space-x-2 text-stone-600 hover:text-stone-900 transition-colors text-sm sm:text-base">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden"
                   style={{
                     background: 'linear-gradient(145deg, #d2b48c, #c8a882)',
                     boxShadow: 'inset 3px 3px 6px rgba(255,255,255,0.4), inset -3px -3px 6px rgba(0,0,0,0.1), 0 2px 8px rgba(210, 180, 140, 0.3)'
                   }}>
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-stone-900 font-playfair">My Memories</h1>
                <p className="text-xs sm:text-sm text-stone-600">Personal Cultural Heritage Collection</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {user && (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Users className="w-4 h-4 text-stone-600" />
                  <span className="text-sm sm:text-base text-stone-700 font-medium">Welcome, {user.firstName}!</span>
                </div>
              )}
              <Link href="/memory-weaver" className="px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all duration-200 whitespace-nowrap">
                <Plus className="w-4 h-4 inline mr-2" />
                Create Memory
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Page Header */}
        <div className="text-center mb-8 md:mb-12">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 font-playfair leading-tight"
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 50%, #1a1a1a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            My Memory Collection
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg sm:text-xl text-stone-700 max-w-3xl mx-auto px-4"
          >
            Manage and organize your personal cultural heritage. Keep your memories private or share them with the world.
          </motion.p>
        </div>

        {/* Stats Overview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8"
        >
          {[
            { label: 'Total Memories', value: memories.length, icon: <FolderOpen className="w-6 h-6" />, color: 'from-blue-500 to-indigo-500' },
            { label: 'Public', value: memories.filter(m => m.isPublic).length, icon: <Unlock className="w-6 h-6" />, color: 'from-green-500 to-emerald-500' },
            { label: 'Private', value: memories.filter(m => !m.isPublic).length, icon: <Lock className="w-6 h-6" />, color: 'from-amber-500 to-orange-500' },
            { label: 'Bookmarked', value: memories.filter(m => m.isBookmarked).length, icon: <Bookmark className="w-6 h-6" />, color: 'from-pink-500 to-rose-500' }
          ].map((stat) => (
            <div key={stat.label} className="bg-white/80 backdrop-blur-md rounded-3xl p-4 md:p-6 shadow-xl border border-white/20"
                 style={{
                   background: 'rgba(255, 255, 255, 0.9)',
                   backdropFilter: 'blur(20px) saturate(180%)',
                   boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
                   borderColor: 'rgba(255, 255, 255, 0.3)'
                 }}>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-3 md:mb-4 mx-auto`}>
                {stat.icon}
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-stone-800 mb-1 md:mb-2">{stat.value}</div>
                <div className="text-xs sm:text-sm text-stone-600">{stat.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-6 md:mb-8"
        >
          <div className="bg-white rounded-3xl p-4 md:p-6 shadow-xl border mb-4 md:mb-6"
               style={{
                 background: 'rgba(255, 255, 255, 0.9)',
                 backdropFilter: 'blur(20px) saturate(180%)',
                 boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
                 borderColor: 'rgba(255, 255, 255, 0.3)'
               }}>
            <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-center justify-between">
              {/* Search Bar */}
              <div className="flex-1 max-w-md w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search your memories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 md:py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>
              </div>

              {/* View Mode and Sort */}
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                {/* View Mode Toggle */}
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-stone-900 text-white' 
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-stone-900 text-white' 
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Sort Options */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'recent' | 'oldest' | 'name' | 'location')}
                  className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent text-sm"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Category and Status Filters */}
          <div className="space-y-4">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg scale-105'
                      : 'bg-white/60 backdrop-blur-md text-stone-600 hover:bg-white/80 hover:scale-105'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {category.icon}
                    <span className="font-medium text-xs sm:text-sm">{category.name}</span>
                    <span className="text-xs opacity-75 hidden sm:inline">({category.count})</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Statuses */}
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
              {statuses.map((status) => (
                <button
                  key={status.id}
                  onClick={() => setSelectedStatus(status.id)}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    selectedStatus === status.id
                      ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-lg scale-105'
                      : 'bg-white/60 backdrop-blur-md text-stone-600 hover:bg-white/80 hover:scale-105'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {status.icon}
                    <span className="font-medium text-xs sm:text-sm">{status.name}</span>
                    <span className="text-xs opacity-75 hidden sm:inline">({status.count})</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <div className="px-4 md:px-6 pb-20">
          <div className="max-w-7xl mx-auto">
            {filteredMemories.length === 0 ? (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center py-20"
              >
                <div className="w-32 h-32 mx-auto mb-8 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full opacity-20 animate-pulse"></div>
                  <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-xl">
                    <Search className="w-16 h-16 text-amber-500" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-stone-800 mb-4">No memories found</h3>
                <p className="text-stone-600 mb-8 max-w-md mx-auto">Try adjusting your search or filters to find your memories</p>
                <Link href="/memory-weaver" className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl font-semibold hover:from-amber-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Memory</span>
                </Link>
              </motion.div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredMemories.map((memory, index) => (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="relative bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105"
                         style={{
                           background: 'rgba(255, 255, 255, 0.9)',
                           backdropFilter: 'blur(20px) saturate(180%)',
                           boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
                           borderColor: 'rgba(255, 255, 255, 0.3)'
                         }}>
                      {/* Header */}
                      <div className={`h-32 bg-gradient-to-br ${getCategoryColor(memory.category)} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/10"></div>
                        
                        {/* Status Indicators */}
                        <div className="absolute top-4 right-4 flex space-x-2">
                          {memory.isPublic ? (
                            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl" title="Public">
                              <Unlock className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl" title="Private">
                              <Lock className="w-4 h-4 text-white" />
                            </div>
                          )}
                          {memory.isBookmarked && (
                            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl" title="Bookmarked">
                              <Bookmark className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>

                        <div className="absolute top-4 left-4">
                          <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                            {getCategoryIcon(memory.category)}
                          </div>
                        </div>
                        
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">{memory.title}</h3>
                          <p className="text-white/90 text-sm line-clamp-1">{memory.description}</p>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {/* Memory Details */}
                        <div className="mb-4">
                          <div className="flex items-center space-x-2 text-sm text-stone-500 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span>{memory.location}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-stone-500">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(memory.date).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Media Preview */}
                        <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4">
                          {memory.mediaFiles.slice(0, 4).map((file) => (
                            <div key={file.id} className="relative group/file">
                              <div className="aspect-square bg-gradient-to-br from-stone-100 to-stone-200 rounded-xl flex items-center justify-center">
                                {getFileTypeIcon(file.type)}
                              </div>
                              <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover/file:opacity-100 transition-opacity flex items-center justify-center">
                                <button className="p-2 bg-white rounded-full shadow-lg">
                                  <Eye className="w-4 h-4 text-stone-900" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {memory.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded-lg">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs sm:text-sm text-stone-500 mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{memory.viewCount}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Share2 className="w-4 h-4" />
                              <span>{memory.shareCount}</span>
                            </div>
                          </div>
                          <div className="text-xs text-stone-400 hidden sm:block">
                            Modified {new Date(memory.lastModified).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="flex space-x-1 sm:space-x-2">
                            <button
                              onClick={() => toggleMemoryStatus(memory.id, 'public')}
                              className={`p-2 rounded-lg transition-colors ${
                                memory.isPublic 
                                  ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                              }`}
                              title={memory.isPublic ? 'Make Private' : 'Make Public'}
                            >
                              {memory.isPublic ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => toggleMemoryStatus(memory.id, 'bookmarked')}
                              className={`p-2 rounded-lg transition-colors ${
                                memory.isBookmarked 
                                  ? 'bg-pink-100 text-pink-600 hover:bg-pink-200' 
                                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                              }`}
                              title={memory.isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex space-x-1 sm:space-x-2">
                            <button className="p-1.5 sm:p-2 rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors" title="Edit">
                              <Edit3 className="w-4 h-4 text-stone-600" />
                            </button>
                            <button className="p-1.5 sm:p-2 rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors" title="Share">
                              <Share2 className="w-4 h-4 text-stone-600" />
                            </button>
                            <button className="p-1.5 sm:p-2 rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors" title="Download">
                              <Download className="w-4 h-4 text-stone-600" />
                            </button>
                            <button className="p-1.5 sm:p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
