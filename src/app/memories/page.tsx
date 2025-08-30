'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Sparkles, 
  FileText, 
  Calendar, 
  MapPin, 
  Heart, 
  Users, 
  Globe, 
  Search, 
  File,
  Share2,
  Download,
  Edit3,
  Star,
  Camera,
  Music,
  Film,
  Archive,
  Layers,
  Compass
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import Link from 'next/link';

interface Memory {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  location: string;
  date: string;
  mediaFiles: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    thumbnail?: string;
  }>;
  culturalContext: string;
  familyMembers: string[];
  emotionalSignificance: string;
  createdAt: Date;
}

export default function MemoriesPage() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'mosaic' | 'journey'>('mosaic');

  // Simulate loading memories
  useEffect(() => {
    const loadMemories = async () => {
      setTimeout(() => {
        const mockMemories: Memory[] = [
          {
            id: '1',
            title: 'Grandmother\'s Traditional Bread Recipe',
            description: 'The secret family recipe passed down through generations',
            category: 'Family',
            tags: ['recipe', 'bread', 'tradition', 'family'],
            location: 'Grandmother\'s Kitchen, Sicily',
            date: '1950-03-15',
            mediaFiles: [
              { id: '1-1', name: 'bread_photo.jpg', type: 'image', size: 2048000, url: '/api/memories/1-1', thumbnail: '/api/memories/1-1/thumb' },
              { id: '1-2', name: 'recipe_audio.m4a', type: 'audio', size: 5120000, url: '/api/memories/1-2' }
            ],
            culturalContext: 'Traditional Sicilian baking methods',
            familyMembers: ['Grandmother Maria', 'Mother Lucia'],
            emotionalSignificance: 'Represents the love and care passed through generations',
            createdAt: new Date('2024-01-15')
          },
          {
            id: '2',
            title: 'Family Migration Journey',
            description: 'The story of our family\'s journey from Italy to America',
            category: 'Historical',
            tags: ['migration', 'family', 'history', 'journey'],
            location: 'Ellis Island, New York',
            date: '1920-06-20',
            mediaFiles: [
              { id: '2-1', name: 'ellis_island.jpg', type: 'image', size: 3072000, url: '/api/memories/2-1', thumbnail: '/api/memories/2-1/thumb' },
              { id: '2-2', name: 'ship_document.pdf', type: 'document', size: 1024000, url: '/api/memories/2-2' }
            ],
            culturalContext: 'Italian immigration to America in the 1920s',
            familyMembers: ['Great-Grandfather Giuseppe', 'Great-Grandmother Rosa'],
            emotionalSignificance: 'Foundation of our family\'s American story',
            createdAt: new Date('2024-01-20')
          },
          {
            id: '3',
            title: 'Cultural Festival Celebration',
            description: 'Annual celebration of our heritage and traditions',
            category: 'Cultural',
            tags: ['festival', 'celebration', 'heritage', 'community'],
            location: 'Little Italy, New York',
            date: '2023-09-15',
            mediaFiles: [
              { id: '3-1', name: 'festival_video.mp4', type: 'video', size: 25600000, url: '/api/memories/3-1', thumbnail: '/api/memories/3-1/thumb' },
              { id: '3-2', name: 'dance_photo.jpg', type: 'image', size: 1536000, url: '/api/memories/3-2', thumbnail: '/api/memories/3-2/thumb' },
              { id: '3-3', name: 'music_recording.m4a', type: 'audio', size: 8192000, url: '/api/memories/3-3' }
            ],
            culturalContext: 'Italian-American cultural preservation',
            familyMembers: ['Uncle Marco', 'Cousin Sofia', 'Aunt Isabella'],
            emotionalSignificance: 'Joy of celebrating our roots together',
            createdAt: new Date('2024-01-25')
          },
          {
            id: '4',
            title: 'Childhood Summer Memories',
            description: 'Warm summer days spent with family in the countryside',
            category: 'Personal',
            tags: ['childhood', 'summer', 'family', 'nature'],
            location: 'Family Farm, Tuscany',
            date: '1995-07-15',
            mediaFiles: [
              { id: '4-1', name: 'summer_photo.jpg', type: 'image', size: 2048000, url: '/api/memories/4-1', thumbnail: '/api/memories/4-1/thumb' },
              { id: '4-2', name: 'cricket_sounds.m4a', type: 'audio', size: 4096000, url: '/api/memories/4-2' }
            ],
            culturalContext: 'Rural Italian family traditions',
            familyMembers: ['Father Antonio', 'Sister Elena', 'Cousin Luca'],
            emotionalSignificance: 'Innocence and wonder of childhood',
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

  // Filter memories based on search and category
  useEffect(() => {
    let filtered = memories;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(memory => memory.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(memory =>
        memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredMemories(filtered);
  }, [memories, searchQuery, selectedCategory]);

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
        return <File className="w-4 h-4" />;
    }
  };

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

  const categories = [
    { id: 'all', name: 'All Memories', icon: <Sparkles className="w-4 h-4" />, count: memories.length },
    { id: 'Family', name: 'Family', icon: <Heart className="w-4 h-4" />, count: memories.filter(m => m.category === 'Family').length },
    { id: 'Cultural', name: 'Cultural', icon: <Globe className="w-4 h-4" />, count: memories.filter(m => m.category === 'Cultural').length },
    { id: 'Personal', name: 'Personal', icon: <Users className="w-4 h-4" />, count: memories.filter(m => m.category === 'Personal').length },
    { id: 'Historical', name: 'Historical', icon: <Archive className="w-4 h-4" />, count: memories.filter(m => m.category === 'Historical').length }
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
              <Sparkles className="w-10 h-10 text-amber-500 animate-bounce" />
            </div>
          </div>
          <p className="text-stone-600 text-lg font-medium">Weaving your memories...</p>
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
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-stone-900 font-playfair">View Memories</h1>
                <p className="text-sm text-stone-600">Your Cultural Heritage Collection</p>
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
            Discover our world
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-stone-700 max-w-2xl mx-auto"
          >
            Explore and relive your precious cultural memories, organized by type and category
          </motion.p>
        </div>

        {/* View Mode Selector */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center space-x-2 mb-8"
        >
          {[
            { id: 'mosaic', name: 'Mosaic', icon: <Layers className="w-4 h-4" /> },
            { id: 'journey', name: 'Journey', icon: <Compass className="w-4 h-4" /> }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as 'mosaic' | 'journey')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                viewMode === mode.id
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg scale-105'
                  : 'bg-white/60 backdrop-blur-md text-stone-600 hover:bg-white/80 hover:scale-105'
              }`}
            >
              <div className="flex items-center space-x-2">
                {mode.icon}
                <span>{mode.name}</span>
              </div>
            </button>
          ))}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
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
                    placeholder="Search memories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Category Filters */}
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
                <h3 className="text-2xl font-bold text-stone-800 mb-4">No memories found</h3>
                <p className="text-stone-600 mb-8 max-w-md mx-auto">Try adjusting your search or filters to discover your cultural treasures</p>
                <Link href="/memory-weaver" className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl font-semibold hover:from-amber-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <Sparkles className="w-5 h-5" />
                  <span>Create Your First Memory</span>
                </Link>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                {viewMode === 'mosaic' && (
                  <motion.div
                    key="mosaic"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
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
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-sm font-medium text-stone-500">{memory.category}</span>
                              <div className="flex space-x-2">
                                <button className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors" title="Edit">
                                  <Edit3 className="w-4 h-4 text-stone-600" />
                                </button>
                                <button className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors" title="Share">
                                  <Share2 className="w-4 h-4 text-stone-600" />
                                </button>
                              </div>
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
                                      <Download className="w-4 h-4 text-stone-900" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between text-sm text-stone-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(memory.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{memory.familyMembers.length}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {viewMode === 'journey' && (
                  <motion.div
                    key="journey"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                  >
                    {/* Journey Path */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-orange-500 to-amber-400 transform -translate-x-1/2"></div>
                    
                    <div className="space-y-12">
                      {filteredMemories.map((memory, index) => (
                        <motion.div
                          key={memory.id}
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.2 }}
                          className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                        >
                          {/* Memory Node */}
                          <div className="relative z-10">
                            <div className="w-6 h-6 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-lg border-4 border-white"></div>
                          </div>

                          {/* Memory Card */}
                          <div className={`flex-1 ${index % 2 === 0 ? 'ml-8' : 'mr-8'}`}>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20"
                              style={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(20px) saturate(180%)',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
                                borderColor: 'rgba(255, 255, 255, 0.3)'
                              }}
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-3">
                                    <div className={`p-2 rounded-xl bg-gradient-to-r ${getCategoryColor(memory.category)}`}>
                                      {getCategoryIcon(memory.category)}
                                    </div>
                                    <div>
                                      <h3 className="text-xl font-bold text-stone-800">{memory.title}</h3>
                                      <p className="text-sm text-stone-500">{memory.category}</p>
                                    </div>
                                  </div>
                                  <p className="text-stone-600 leading-relaxed">{memory.description}</p>
                                </div>
                                
                                <div className="flex space-x-2 ml-4">
                                  <button className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors" title="Edit">
                                    <Edit3 className="w-4 h-4 text-stone-600" />
                                  </button>
                                  <button className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors" title="Share">
                                    <Share2 className="w-4 h-4 text-stone-600" />
                                  </button>
                                </div>
                              </div>

                              {/* Quick Stats */}
                              <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="text-center p-3 bg-stone-50 rounded-xl">
                                  <div className="text-2xl font-bold text-stone-800">{memory.mediaFiles.length}</div>
                                  <div className="text-xs text-stone-500">Files</div>
                                </div>
                                <div className="text-center p-3 bg-stone-50 rounded-xl">
                                  <div className="text-2xl font-bold text-stone-800">{memory.familyMembers.length}</div>
                                  <div className="text-xs text-stone-500">Family</div>
                                </div>
                                <div className="text-center p-3 bg-stone-50 rounded-xl">
                                  <div className="text-2xl font-bold text-stone-800">{memory.tags.length}</div>
                                  <div className="text-xs text-stone-500">Tags</div>
                                </div>
                              </div>

                              {/* Date and Location */}
                              <div className="flex items-center justify-between text-sm text-stone-500">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(memory.date).toLocaleDateString()}</span>
                                </div>
                                {memory.location && (
                                  <div className="flex items-center space-x-2">
                                    <MapPin className="w-4 h-4" />
                                    <span className="truncate max-w-32">{memory.location}</span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
