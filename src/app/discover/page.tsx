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
  TrendingUp,
  Compass,
  BookOpen,
  Camera,
  Music,
  Film,
  FileText,
  Eye,
  Share2,
  Target
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import Link from 'next/link';

interface CulturalMemory {
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
  author: {
    name: string;
    avatar: string;
    location: string;
  };
  likes: number;
  shares: number;
  isPublic: boolean;
  createdAt: Date;
}

export default function DiscoverPage() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<CulturalMemory[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<CulturalMemory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading cultural memories
  useEffect(() => {
    const loadMemories = async () => {
      setTimeout(() => {
        const mockMemories: CulturalMemory[] = [
          {
            id: '1',
            title: 'Traditional Japanese Tea Ceremony',
            description: 'The ancient art of Japanese tea ceremony, preserving centuries of cultural tradition and mindfulness',
            category: 'Cultural',
            tags: ['tea ceremony', 'japan', 'tradition', 'mindfulness', 'zen'],
            location: 'Kyoto, Japan',
            date: '2024-01-15',
            culturalContext: 'Japanese cultural heritage and spiritual practice',
            familyMembers: ['Master Tea Ceremonist', 'Cultural Preservation Society'],
            emotionalSignificance: 'Represents harmony, respect, and tranquility in Japanese culture',
            mediaFiles: [
              { id: '1-1', name: 'tea_ceremony.jpg', type: 'image', size: 2048000, url: '/api/discover/1-1', thumbnail: '/api/discover/1-1/thumb' },
              { id: '1-2', name: 'ceremony_audio.m4a', type: 'audio', size: 5120000, url: '/api/discover/1-2' }
            ],
            author: {
              name: 'Yuki Tanaka',
              avatar: '/avatars/yuki.jpg',
              location: 'Kyoto, Japan'
            },
            likes: 1247,
            shares: 89,
            isPublic: true,
            createdAt: new Date('2024-01-15')
          },
          {
            id: '2',
            title: 'Native American Storytelling Traditions',
            description: 'Oral traditions passed down through generations, preserving the wisdom and history of indigenous peoples',
            category: 'Historical',
            tags: ['native american', 'storytelling', 'oral tradition', 'indigenous', 'wisdom'],
            location: 'Various Reservations, USA',
            date: '2024-01-20',
            culturalContext: 'Indigenous American cultural preservation and knowledge transmission',
            familyMembers: ['Tribal Elders', 'Cultural Preservation Council'],
            emotionalSignificance: 'Maintains connection to ancestral wisdom and cultural identity',
            mediaFiles: [
              { id: '2-1', name: 'storytelling_video.mp4', type: 'video', size: 25600000, url: '/api/discover/2-1', thumbnail: '/api/discover/2-1/thumb' },
              { id: '2-2', name: 'tribal_songs.m4a', type: 'audio', size: 8192000, url: '/api/discover/2-2' }
            ],
            author: {
              name: 'Chief Running Bear',
              avatar: '/avatars/chief.jpg',
              location: 'Navajo Nation, Arizona'
            },
            likes: 2156,
            shares: 156,
            isPublic: true,
            createdAt: new Date('2024-01-20')
          },
          {
            id: '3',
            title: 'Italian Renaissance Art Techniques',
            description: 'Mastering the techniques of Renaissance masters, from fresco painting to sculpture',
            category: 'Cultural',
            tags: ['renaissance', 'art', 'italy', 'painting', 'sculpture', 'techniques'],
            location: 'Florence, Italy',
            date: '2024-01-25',
            culturalContext: 'European Renaissance artistic heritage and craftsmanship',
            familyMembers: ['Art Conservators', 'Cultural Heritage Institute'],
            emotionalSignificance: 'Preserves the artistic legacy that shaped Western civilization',
            mediaFiles: [
              { id: '3-1', name: 'fresco_technique.jpg', type: 'image', size: 3072000, url: '/api/discover/3-1', thumbnail: '/api/discover/3-1/thumb' },
              { id: '3-2', name: 'technique_document.pdf', type: 'document', size: 1024000, url: '/api/discover/3-2' }
            ],
            author: {
              name: 'Marco Rossi',
              avatar: '/avatars/marco.jpg',
              location: 'Florence, Italy'
            },
            likes: 892,
            shares: 67,
            isPublic: true,
            createdAt: new Date('2024-01-25')
          },
          {
            id: '4',
            title: 'African Drumming Traditions',
            description: 'The heartbeat of African culture, preserving rhythmic traditions and community bonding',
            category: 'Cultural',
            tags: ['african', 'drumming', 'rhythm', 'community', 'tradition', 'music'],
            location: 'Various African Nations',
            date: '2024-02-01',
            culturalContext: 'African musical heritage and community cultural practices',
            familyMembers: ['Drum Masters', 'Cultural Music Society'],
            emotionalSignificance: 'Represents unity, celebration, and cultural identity across Africa',
            mediaFiles: [
              { id: '4-1', name: 'drumming_video.mp4', type: 'video', size: 20480000, url: '/api/discover/4-1', thumbnail: '/api/discover/4-1/thumb' },
              { id: '4-2', name: 'rhythm_patterns.m4a', type: 'audio', size: 6144000, url: '/api/discover/4-2' }
            ],
            author: {
              name: 'Kofi Addo',
              avatar: '/avatars/kofi.jpg',
              location: 'Accra, Ghana'
            },
            likes: 1678,
            shares: 134,
            isPublic: true,
            createdAt: new Date('2024-02-01')
          }
        ];
        setMemories(mockMemories);
        setFilteredMemories(mockMemories);
        setIsLoading(false);
      }, 1000);
    };

    loadMemories();
  }, []);

  // Filter memories based on search, category, and region
  useEffect(() => {
    let filtered = memories;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(memory => memory.category === selectedCategory);
    }

    if (selectedRegion !== 'all') {
      filtered = filtered.filter(memory => {
        if (selectedRegion === 'asia') return memory.location.includes('Japan') || memory.location.includes('China') || memory.location.includes('India');
        if (selectedRegion === 'americas') return memory.location.includes('USA') || memory.location.includes('Canada') || memory.location.includes('Mexico');
        if (selectedRegion === 'europe') return memory.location.includes('Italy') || memory.location.includes('France') || memory.location.includes('Germany');
        if (selectedRegion === 'africa') return memory.location.includes('Ghana') || memory.location.includes('Nigeria') || memory.location.includes('Kenya');
        return true;
      });
    }

    if (searchQuery) {
      filtered = filtered.filter(memory =>
        memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        memory.culturalContext.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort memories
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.likes - a.likes;
        case 'trending':
          return b.shares - a.shares;
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredMemories(filtered);
  }, [memories, searchQuery, selectedCategory, selectedRegion, sortBy]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Cultural':
        return <Globe className="w-5 h-5" />;
      case 'Historical':
        return <Archive className="w-5 h-5" />;
      case 'Family':
        return <Heart className="w-5 h-5" />;
      case 'Personal':
        return <Users className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Cultural':
        return 'from-blue-500 to-indigo-500';
      case 'Historical':
        return 'from-amber-500 to-orange-500';
      case 'Family':
        return 'from-pink-500 to-rose-500';
      case 'Personal':
        return 'from-green-500 to-emerald-500';
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
    { id: 'Cultural', name: 'Cultural', icon: <Globe className="w-4 h-4" />, count: memories.filter(m => m.category === 'Cultural').length },
    { id: 'Historical', name: 'Historical', icon: <Archive className="w-4 h-4" />, count: memories.filter(m => m.category === 'Historical').length },
    { id: 'Family', name: 'Family', icon: <Heart className="w-4 h-4" />, count: memories.filter(m => m.category === 'Family').length },
    { id: 'Personal', name: 'Personal', icon: <Users className="w-4 h-4" />, count: memories.filter(m => m.category === 'Personal').length }
  ];

  const regions = [
    { id: 'all', name: 'All Regions', icon: <Globe className="w-4 h-4" /> },
    { id: 'asia', name: 'Asia', icon: <Compass className="w-4 h-4" /> },
    { id: 'americas', name: 'Americas', icon: <MapPin className="w-4 h-4" /> },
    { id: 'europe', name: 'Europe', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'africa', name: 'Africa', icon: <Target className="w-4 h-4" /> }
  ];

  const sortOptions = [
    { id: 'recent', name: 'Most Recent', icon: <Calendar className="w-4 h-4" /> },
    { id: 'popular', name: 'Most Popular', icon: <Heart className="w-4 h-4" /> },
    { id: 'trending', name: 'Trending', icon: <TrendingUp className="w-4 h-4" /> }
  ];

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
              <Compass className="w-10 h-10 text-amber-500 animate-bounce" />
            </div>
          </div>
          <p className="text-stone-600 text-lg font-medium">Discovering cultural treasures...</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden"
                   style={{
                     background: 'linear-gradient(145deg, #d2b48c, #c8a882)',
                     boxShadow: 'inset 3px 3px 6px rgba(255,255,255,0.4), inset -3px -3px 6px rgba(0,0,0,0.1), 0 2px 8px rgba(210, 180, 140, 0.3)'
                   }}>
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-stone-900 font-playfair">Discover</h1>
                <p className="text-sm text-stone-600">Explore Cultural Heritage Worldwide</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-stone-600" />
                  <span className="text-stone-700 font-medium">Welcome, {user.firstName}!</span>
                </div>
              )}
              <Link href="/memory-weaver" className="px-4 py-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all duration-200">
                <Sparkles className="w-4 h-4 inline mr-2" />
                Memory Weaver
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold mb-6 font-playfair leading-tight"
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 50%, #1a1a1a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Discover Cultural Heritage
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-stone-700 max-w-3xl mx-auto"
          >
            Explore the rich tapestry of human culture from around the world. Discover stories, traditions, and memories that connect us all.
          </motion.p>
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white rounded-3xl p-6 shadow-xl border mb-6"
               style={{
                 background: 'rgba(255, 255, 255, 0.9)',
                 backdropFilter: 'blur(20px) saturate(180%)',
                 boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
                 borderColor: 'rgba(255, 255, 255, 0.3)'
               }}>
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Search Bar */}
              <div className="flex-1 max-w-md w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search cultural heritage..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div className="flex items-center space-x-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSortBy(option.id as 'recent' | 'popular' | 'trending')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      sortBy === option.id 
                        ? 'bg-stone-900 text-white' 
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                    title={option.name}
                  >
                    {option.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category and Region Filters */}
          <div className="space-y-4">
            {/* Categories */}
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg scale-105'
                      : 'bg-white/60 backdrop-blur-md text-stone-600 hover:bg-white/80 hover:scale-105'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {category.icon}
                    <span className="font-medium">{category.name}</span>
                    <span className="text-xs opacity-75">({category.count})</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Regions */}
            <div className="flex flex-wrap gap-3 justify-center">
              {regions.map((region) => (
                <button
                  key={region.id}
                  onClick={() => setSelectedRegion(region.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    selectedRegion === region.id
                      ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-lg scale-105'
                      : 'bg-white/60 backdrop-blur-md text-stone-600 hover:bg-white/80 hover:scale-105'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {region.icon}
                    <span className="font-medium">{region.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <div className="px-6 pb-20">
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
                <h3 className="text-2xl font-bold text-stone-800 mb-4">No cultural memories found</h3>
                <p className="text-stone-600 mb-8 max-w-md mx-auto">Try adjusting your search or filters to discover cultural treasures</p>
                <Link href="/memory-weaver" className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl font-semibold hover:from-amber-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <Sparkles className="w-5 h-5" />
                  <span>Share Your Culture</span>
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        {/* Author Info */}
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-stone-200 to-stone-300 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-stone-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-stone-800">{memory.author.name}</p>
                            <p className="text-sm text-stone-500 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {memory.author.location}
                            </p>
                          </div>
                        </div>

                        {/* Cultural Context */}
                        <div className="mb-4">
                          <p className="text-sm text-stone-600 line-clamp-2">{memory.culturalContext}</p>
                        </div>

                        {/* Media Preview */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
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

                        {/* Footer */}
                        <div className="flex items-center justify-between text-sm text-stone-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>{memory.likes}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Share2 className="w-4 h-4" />
                              <span>{memory.shares}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(memory.date).toLocaleDateString()}</span>
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
