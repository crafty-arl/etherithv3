import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen cultural-gradient">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="heritage-text text-6xl font-bold mb-6">
            Etherith
          </h1>
          <p className="modern-text text-xl mb-8 max-w-3xl mx-auto">
            Preserving ancestral memories, stories, and cultural heritage for future generations. 
            Join us in protecting what makes our communities unique and valuable.
          </p>
          
          <div className="flex gap-4 justify-center mb-12">
            <Button asChild size="lg" className="bg-cultural-600 hover:bg-cultural-700">
              <Link href="/auth/register">
                Get Started
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">
                Learn More
              </Link>
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white/80 rounded-lg shadow-lg">
              <h3 className="heritage-text text-xl font-semibold mb-3">Cultural Preservation</h3>
              <p className="modern-text">Safeguard ancestral memories and cultural stories from being lost or appropriated.</p>
            </div>
            <div className="text-center p-6 bg-white/80 rounded-lg shadow-lg">
              <h3 className="heritage-text text-xl font-semibold mb-3">AI-Enhanced Memory</h3>
              <p className="modern-text">Leverage artificial intelligence to intelligently organize and preserve memories.</p>
            </div>
            <div className="text-center p-6 bg-white/80 rounded-lg shadow-lg">
              <h3 className="heritage-text text-xl font-semibold mb-3">IPFS Storage</h3>
              <p className="modern-text">Permanent, decentralized storage on the IPFS network via Pinata.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
