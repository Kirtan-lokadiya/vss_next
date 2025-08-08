import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '@/src/components/ui/Header';
import Sidebar from '@/src/components/ui/Sidebar';
import NavigationBreadcrumb from '@/src/components/ui/NavigationBreadcrumb';
import BlogHeader from './components/BlogHeader';
import BlogContent from './components/BlogContent';
import TableOfContents from './components/TableOfContents';
import RelatedPosts from './components/RelatedPosts';
import AuthorCard from './components/AuthorCard';
import EngagementSection from './components/EngagementSection';
import CommentSection from './components/CommentSection';
import ReadingProgress from './components/ReadingProgress';

const BlogDetailView = () => {
  const router = useRouter();
  const articleId = router.query.id || '1';

  // Mock article data
  const article = {
    id: articleId,
    title: "The Future of Remote Work: How AI is Transforming Professional Collaboration",
    subtitle: "Exploring the intersection of artificial intelligence and distributed teams in the post-pandemic workplace",
    author: {
      name: "Sarah Chen",
      title: "Senior Product Manager at TechFlow",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
      verified: true,
      bio: `Sarah is a product management leader with 8+ years of experience building AI-powered collaboration tools. She's passionate about the future of work and has led teams across 15+ countries.`,
      stats: {
        followers: "12.5K",
        articles: 47,
        likes: "8.2K"
      },
      recentArticles: [
        {
          id: "2",
          title: "Building Inclusive Remote Teams: Lessons from Global Startups",
          thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
          publishedDate: "Dec 8, 2024",
          readingTime: 6
        },
        {
          id: "3", 
          title: "The Psychology of Virtual Meetings: What Research Tells Us",
          thumbnail: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop",
          publishedDate: "Nov 25, 2024",
          readingTime: 8
        }
      ]
    },
    publishedDate: "December 12, 2024",
    readingTime: 12,
    views: "2.4K",
    featuredImage: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=400&fit=crop",
    tags: ["Remote Work", "AI", "Collaboration", "Future of Work", "Technology"],
    reactions: {
      like: 156,
      love: 43,
      insightful: 89,
      celebrate: 21
    },
    comments: 34,
    shares: 67,
    content: [
      {
        type: 'paragraph',
        content: `The landscape of professional work has undergone a seismic shift in recent years. What began as an emergency response to global circumstances has evolved into a fundamental reimagining of how, where, and when we work. At the heart of this transformation lies artificial intelligence—not as a replacement for human creativity and collaboration, but as an amplifier of our collective potential.`
      },
      {
        type: 'heading',level: 2,id: 'ai-collaboration-tools',content: 'AI-Powered Collaboration Tools: Beyond Video Calls'
      },
      {
        type: 'paragraph',content: `Traditional remote work tools focused primarily on replicating in-person interactions through video conferencing and instant messaging. Today's AI-enhanced platforms go several steps further, understanding context, predicting needs, and facilitating connections that might never have occurred organically.`
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop',
        alt: 'AI collaboration dashboard showing team analytics',
        caption: 'Modern AI collaboration platforms provide real-time insights into team dynamics and productivity patterns'
      },
      {
        type: 'paragraph',
        content: `Consider the evolution of meeting intelligence. AI systems now transcribe conversations in real-time, identify action items, and even suggest optimal meeting times based on participants' energy levels and availability patterns. These tools don't just record what happened—they help ensure nothing falls through the cracks.`
      },
      {
        type: 'heading',
        level: 2,
        id: 'breaking-down-barriers',
        content: 'Breaking Down Geographic and Cultural Barriers'
      },
      {
        type: 'paragraph',
        content: `One of the most profound impacts of AI in remote work is its ability to bridge cultural and linguistic divides. Real-time translation services have evolved beyond simple word substitution to understand context, tone, and cultural nuances.`
      },
      {
        type: 'quote',
        content: 'AI doesn\'t replace human connection—it removes the friction that prevents authentic collaboration from happening.',
        author: 'Dr. Maria Rodriguez, Workplace Psychology Researcher'
      },
      {
        type: 'list',
        ordered: false,
        items: [
          'Intelligent language translation that preserves meaning and tone',
          'Cultural context suggestions for cross-border communications',
          'Timezone optimization for global team coordination',
          'Bias detection in written communications',
          'Accessibility enhancements for team members with disabilities'
        ]
      },
      {
        type: 'heading',
        level: 2,
        id: 'productivity-insights',
        content: 'Data-Driven Productivity Insights'
      },
      {
        type: 'paragraph',
        content: `The remote work revolution has generated unprecedented amounts of data about how we work. AI systems can analyze patterns in communication, collaboration, and output to provide insights that were impossible to gather in traditional office environments.`
      },
      {
        type: 'paragraph',
        content: `These insights aren't about surveillance—they're about optimization. Teams can understand their natural rhythms, identify bottlenecks in processes, and discover collaboration patterns that lead to breakthrough innovations.`
      },
      {
        type: 'code',
        language: 'python',
        content: `# Example: AI-powered team productivity analysis
def analyze_team_patterns(team_data):
    collaboration_score = calculate_collaboration_index(team_data)
    optimal_meeting_times = find_peak_energy_windows(team_data)
    communication_health = assess_communication_patterns(team_data)
    
    return {
        'collaboration_score': collaboration_score,
        'optimal_times': optimal_meeting_times,
        'communication_health': communication_health,
        'recommendations': generate_recommendations(team_data)
    }`
      },
      {
        type: 'heading',
        level: 2,
        id: 'challenges-considerations',
        content: 'Challenges and Ethical Considerations'
      },
      {
        type: 'paragraph',
        content: `As we embrace AI-enhanced remote work, we must also grapple with important questions about privacy, autonomy, and the human elements that make work meaningful. The goal isn't to create perfectly optimized robots, but to free humans to do what they do best: create, innovate, and connect.`
      },
      {
        type: 'paragraph',
        content: `Organizations implementing AI tools must be transparent about data collection, ensure employee agency in how these tools are used, and maintain focus on human well-being alongside productivity metrics.`
      },
      {
        type: 'divider'
      },
      {
        type: 'heading',level: 2,id: 'looking-ahead',content: 'Looking Ahead: The Next Frontier'
      },
      {
        type: 'paragraph',content: `The future of remote work isn't just about better tools—it's about fundamentally reimagining what work can be. As AI continues to evolve, we're moving toward a world where geography becomes irrelevant, where the best ideas can come from anywhere, and where technology serves to enhance rather than replace human creativity and connection.`
      },
      {
        type: 'paragraph',
        content: `The organizations that thrive in this new landscape will be those that embrace both the technological possibilities and the human realities of distributed work. They'll use AI not as a crutch, but as a catalyst for building stronger, more inclusive, and more innovative teams.`
      }
    ]
  };

  // Extract headings for table of contents
  const tableOfContents = article.content
    .filter(block => block.type === 'heading')
    .map(heading => ({
      id: heading.id,
      title: heading.content,
      level: heading.level
    }));

  // Mock related posts
  const relatedPosts = [
    {
      id: "4",
      title: "Building Async-First Culture: A Complete Guide",
      thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
      author: "Michael Torres",
      readingTime: 8,
      likes: 234,
      comments: 45
    },
    {
      id: "5",
      title: "The Science of Virtual Team Building",
      thumbnail: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=400&h=300&fit=crop",
      author: "Lisa Park",
      readingTime: 6,
      likes: 189,
      comments: 32
    },
    {
      id: "6",
      title: "Remote Work Security: Protecting Distributed Teams",
      thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop",
      author: "David Kim",
      readingTime: 10,
      likes: 156,
      comments: 28
    }
  ];

  // Mock comments
  const comments = [
    {
      id: 1,
      author: {
        name: "Alex Johnson",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
        title: "Engineering Manager"
      },
      content: "This is exactly what we've been experiencing at our company. The AI-powered meeting summaries have been a game-changer for our distributed team. Great insights, Sarah!",
      timestamp: "2 hours ago",
      likes: 12,
      isLiked: false,
      replies: [
        {
          id: 11,
          author: {
            name: "Sarah Chen",
            avatar: "https://randomuser.me/api/portraits/women/32.jpg",
            title: "Senior Product Manager"
          },
          content: "Thanks Alex! I'd love to hear more about your specific implementation. Have you noticed any particular patterns in how your team adapts to these tools?",
          timestamp: "1 hour ago",
          likes: 5,
          isLiked: false
        }
      ]
    },
    {
      id: 2,
      author: {
        name: "Maria Rodriguez",
        avatar: "https://randomuser.me/api/portraits/women/28.jpg",
        title: "UX Designer"
      },
      content: "The section on breaking down cultural barriers really resonates with me. Working with teams across 4 continents, I've seen firsthand how AI translation tools have evolved beyond just words to understanding context.",
      timestamp: "4 hours ago",
      likes: 8,
      isLiked: true,
      replies: []
    },
    {
      id: 3,
      author: {
        name: "James Wilson",
        avatar: "https://randomuser.me/api/portraits/men/52.jpg",
        title: "VP of Engineering"
      },
      content: "While I appreciate the optimism about AI in remote work, I think we need to be more cautious about the privacy implications. How do we balance productivity insights with employee privacy?",
      timestamp: "6 hours ago",
      likes: 15,
      isLiked: false,
      replies: [
        {
          id: 31,
          author: {
            name: "Emily Davis",
            avatar: "https://randomuser.me/api/portraits/women/41.jpg",
            title: "Privacy Advocate"
          },
          content: "Absolutely agree, James. Transparency and employee consent should be at the forefront of any AI implementation in the workplace.",
          timestamp: "5 hours ago",
          likes: 7,
          isLiked: false
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      <ReadingProgress />
      
      <main className="lg:ml-80 pt-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          {/* Breadcrumb Navigation */}
          <NavigationBreadcrumb className="mb-6" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8">
              <article className="bg-card border border-border rounded-lg p-8 mb-8">
                <BlogHeader article={article} />
                <BlogContent content={article.content} tableOfContents={tableOfContents} />
              </article>
              
              {/* Engagement Section */}
              <EngagementSection article={article} className="mb-8" />
              
              {/* Author Card */}
              <AuthorCard author={article.author} className="mb-8" />
              
              {/* Comments Section */}
              <CommentSection comments={comments} />
            </div>
            
            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Table of Contents */}
              <TableOfContents headings={tableOfContents} />
              
              {/* Related Posts */}
              <RelatedPosts posts={relatedPosts} />
              
              {/* Newsletter Signup */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-center">
                  <h3 className="font-semibold text-foreground mb-2">Stay Updated</h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Get the latest insights on remote work and AI delivered to your inbox.
                  </p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-micro">
                      Subscribe
                    </button>
                  </div>
                  <p className="text-xs text-text-secondary mt-2">
                    No spam. Unsubscribe anytime.
                  </p>
                </div>
              </div>
              
              {/* Popular Tags */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4">Popular Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {['Remote Work', 'AI', 'Productivity', 'Leadership', 'Technology', 'Innovation', 'Culture', 'Future of Work'].map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-muted text-text-secondary text-sm rounded-full hover:bg-secondary/20 transition-micro cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlogDetailView;