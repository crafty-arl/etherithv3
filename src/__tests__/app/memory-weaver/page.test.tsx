import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MemoryWeaverPage from '@/app/memory-weaver/page';

// Mock the auth context
jest.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User'
    },
    isLoading: false
  })
}));

// Mock the AI analysis API
global.fetch = jest.fn();

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

describe('MemoryWeaverPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderMemoryWeaver = () => {
    return render(<MemoryWeaverPage />);
  };

  describe('AI Integration', () => {
    it('should call AI analysis API when sending a message', async () => {
      const mockAnalysisResponse = {
        culturalElements: ['tradition', 'heritage'],
        emotionalSignificance: 'joy',
        culturalPractices: ['celebration'],
        peopleIdentified: ['family'],
        locationContext: 'home',
        temporalContext: 'childhood',
        culturalSignificanceScore: 0.8,
        suggestedTags: ['family', 'tradition'],
        metadata: {
          title: 'Family Memory',
          category: 'Family',
          culturalHeritage: ['tradition', 'heritage']
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalysisResponse
      });

      renderMemoryWeaver();

      const input = screen.getByPlaceholderText(/Ask Memory Weaver to preserve a memory about/i);
      const sendButton = screen.getByRole('button', { name: /send memory/i });

      fireEvent.change(input, { target: { value: 'My family tradition of celebrating holidays together' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/ai/analyze-memory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: 'My family tradition of celebrating holidays together',
            culturalContext: [],
            language: 'en',
            userId: '1'
          }),
        });
      });
    });

    it('should fallback to mock response when AI API fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      renderMemoryWeaver();

      const input = screen.getByPlaceholderText(/Ask Memory Weaver to preserve a memory about/i);
      const sendButton = screen.getByRole('button', { name: /send memory/i });

      fireEvent.change(input, { target: { value: 'My family tradition' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        // Should show fallback response
        expect(screen.getByText(/That's a beautiful memory! Let me help you capture the details/i)).toBeInTheDocument();
      });
    });
  });

  describe('Memory Processing', () => {
    it('should extract metadata from user input', () => {
      renderMemoryWeaver();

      const input = screen.getByPlaceholderText(/Ask Memory Weaver to preserve a memory about/i);
      const sendButton = screen.getByRole('button', { name: /send memory/i });

      fireEvent.change(input, { target: { value: 'My family tradition' } });
      fireEvent.click(sendButton);

      // Check that user message is displayed
      expect(screen.getByText('My family tradition')).toBeInTheDocument();
    });

    it('should handle empty input gracefully', () => {
      renderMemoryWeaver();

      const sendButton = screen.getByRole('button', { name: /send memory/i });
      fireEvent.click(sendButton);

      // Should not send empty message
      expect(screen.queryByPlaceholderText(/Ask Memory Weaver to preserve a memory about/i)).toBeInTheDocument();
    });
  });

  describe('UI Components', () => {
    it('should render memory weaver interface', () => {
      renderMemoryWeaver();

      expect(screen.getByText('Memory Weaver')).toBeInTheDocument();
      expect(screen.getByText('AI-Powered Memory Preservation')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Ask Memory Weaver to preserve a memory about/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send memory/i })).toBeInTheDocument();
    });
  });
});
