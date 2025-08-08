import React, { useState } from 'react';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';

const FeedbackSystem = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState('recent');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'general',
    title: '',
    description: '',
    email: '',
    priority: 'medium'
  });

  const feedbackData = [
    {
      id: 1,
      type: 'feature',
      title: 'Add dark mode support',
      description: 'It would be great to have a dark mode option for better user experience during night time usage.',
      author: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      date: '2025-07-10',
      status: 'under-review',
      priority: 'high',
      votes: 24,
      responses: [
        {
          author: 'Product Team',
          message: 'Thanks for the suggestion! Dark mode is on our roadmap for Q3 2025.',
          date: '2025-07-11',
          isOfficial: true
        }
      ]
    },
    {
      id: 2,
      type: 'bug',
      title: 'Search functionality not working on mobile',
      description: 'The search bar becomes unresponsive on mobile devices when typing more than 10 characters.',
      author: 'Mike Chen',
      email: 'mike.chen@email.com',
      date: '2025-07-09',
      status: 'resolved',
      priority: 'high',
      votes: 18,
      responses: [
        {
          author: 'Development Team',
          message: 'This issue has been fixed in version 2.1.3. Please update your app.',
          date: '2025-07-10',
          isOfficial: true
        }
      ]
    },
    {
      id: 3,
      type: 'improvement',
      title: 'Better product filtering options',
      description: 'Add more granular filtering options like price range, user ratings, and release date.',
      author: 'Alex Rodriguez',
      email: 'alex.r@email.com',
      date: '2025-07-08',
      status: 'planned',
      priority: 'medium',
      votes: 31,
      responses: []
    }
  ];

  const tabs = [
    { id: 'recent', label: 'Recent Feedback', icon: 'Clock' },
    { id: 'popular', label: 'Most Popular', icon: 'TrendingUp' },
    { id: 'resolved', label: 'Resolved', icon: 'CheckCircle' },
    { id: 'submit', label: 'Submit Feedback', icon: 'Plus' }
  ];

  const feedbackTypes = [
    { value: 'feature', label: 'Feature Request', icon: 'Lightbulb' },
    { value: 'bug', label: 'Bug Report', icon: 'Bug' },
    { value: 'improvement', label: 'Improvement', icon: 'TrendingUp' },
    { value: 'general', label: 'General Feedback', icon: 'MessageSquare' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'under-review': return 'bg-warning text-warning-foreground';
      case 'planned': return 'bg-primary text-primary-foreground';
      case 'resolved': return 'bg-success text-success-foreground';
      case 'rejected': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-text-secondary';
    }
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    console.log('Feedback submitted:', feedbackForm);
    setFeedbackForm({
      type: 'general',
      title: '',
      description: '',
      email: '',
      priority: 'medium'
    });
    setShowFeedbackForm(false);
    setActiveTab('recent');
  };

  const handleVote = (feedbackId) => {
    console.log('Voted for feedback:', feedbackId);
  };

  const filteredFeedback = feedbackData.filter(item => {
    switch (activeTab) {
      case 'popular':
        return item.votes > 20;
      case 'resolved':
        return item.status === 'resolved';
      default:
        return true;
    }
  }).sort((a, b) => {
    switch (activeTab) {
      case 'popular':
        return b.votes - a.votes;
      default:
        return new Date(b.date) - new Date(a.date);
    }
  });

  return (
    <div className={`bg-card border border-border rounded-lg shadow-card ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Community Feedback</h2>
            <p className="text-sm text-text-secondary mt-1">
              Share your ideas and help us improve our products
            </p>
          </div>
          <Button
            variant="default"
            onClick={() => {
              setActiveTab('submit');
              setShowFeedbackForm(true);
            }}
            iconName="Plus"
            iconPosition="left"
          >
            Submit Feedback
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'submit') {
                  setShowFeedbackForm(true);
                } else {
                  setShowFeedbackForm(false);
                }
              }}
              className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary' :'border-transparent text-text-secondary hover:text-foreground'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {showFeedbackForm ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Submit New Feedback</h3>
              <p className="text-text-secondary">
                Help us improve by sharing your thoughts, reporting bugs, or suggesting new features.
              </p>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Feedback Type
                  </label>
                  <select
                    value={feedbackForm.type}
                    onChange={(e) => setFeedbackForm({...feedbackForm, type: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {feedbackTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Priority
                  </label>
                  <select
                    value={feedbackForm.priority}
                    onChange={(e) => setFeedbackForm({...feedbackForm, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <Input
                label="Your Email"
                type="email"
                value={feedbackForm.email}
                onChange={(e) => setFeedbackForm({...feedbackForm, email: e.target.value})}
                placeholder="your.email@example.com"
                required
              />

              <Input
                label="Title"
                type="text"
                value={feedbackForm.title}
                onChange={(e) => setFeedbackForm({...feedbackForm, title: e.target.value})}
                placeholder="Brief title for your feedback"
                required
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={feedbackForm.description}
                  onChange={(e) => setFeedbackForm({...feedbackForm, description: e.target.value})}
                  placeholder="Provide detailed feedback, steps to reproduce (for bugs), or feature specifications..."
                  rows={5}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  type="submit"
                  variant="default"
                  iconName="Send"
                  iconPosition="right"
                >
                  Submit Feedback
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowFeedbackForm(false);
                    setActiveTab('recent');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeedback.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="MessageSquare" size={48} className="text-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No feedback found</h3>
                <p className="text-text-secondary">
                  Be the first to share your thoughts and help us improve!
                </p>
              </div>
            ) : (
              filteredFeedback.map((feedback) => (
                <div key={feedback.id} className="border border-border rounded-lg p-4 hover:shadow-card transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <Icon 
                          name={feedbackTypes.find(t => t.value === feedback.type)?.icon || 'MessageSquare'} 
                          size={20} 
                          className="text-text-secondary" 
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{feedback.title}</h4>
                        <div className="flex items-center space-x-2 text-sm text-text-secondary">
                          <span>by {feedback.author}</span>
                          <span>•</span>
                          <span>{feedback.date}</span>
                          <span>•</span>
                          <span className={getPriorityColor(feedback.priority)}>
                            {feedback.priority} priority
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(feedback.status)}`}>
                        {feedback.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>

                  <p className="text-text-secondary mb-4 leading-relaxed">
                    {feedback.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleVote(feedback.id)}
                      className="flex items-center space-x-2 text-text-secondary hover:text-primary transition-colors"
                    >
                      <Icon name="ThumbsUp" size={16} />
                      <span className="text-sm">{feedback.votes} votes</span>
                    </button>
                    <div className="flex items-center space-x-2 text-sm text-text-secondary">
                      <Icon name="MessageCircle" size={16} />
                      <span>{feedback.responses.length} responses</span>
                    </div>
                  </div>

                  {/* Responses */}
                  {feedback.responses.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                      {feedback.responses.map((response, index) => (
                        <div key={index} className="flex space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            response.isOfficial ? 'bg-primary' : 'bg-muted'
                          }`}>
                            <Icon 
                              name={response.isOfficial ? "Shield" : "User"} 
                              size={16} 
                              color={response.isOfficial ? "white" : "currentColor"}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`text-sm font-medium ${
                                response.isOfficial ? 'text-primary' : 'text-foreground'
                              }`}>
                                {response.author}
                              </span>
                              {response.isOfficial && (
                                <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-md">
                                  Official
                                </span>
                              )}
                              <span className="text-xs text-text-secondary">{response.date}</span>
                            </div>
                            <p className="text-sm text-text-secondary">{response.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackSystem;