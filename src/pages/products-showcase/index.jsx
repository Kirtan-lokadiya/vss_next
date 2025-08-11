import React, { useState } from 'react';
import Header from '@/src/components/ui/Header';
import NavigationBreadcrumb from '@/src/components/ui/NavigationBreadcrumb';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';

const questions = [
  'What everyday problem do you wish had an easier or cheaper solution?',
  'If you had unlimited resources, what product or service would you create tomorrow?',
  'What’s one frustrating experience you’ve had this month that technology could fix?',
  'How could your favorite hobby be made more enjoyable or accessible to others?',
  'Which outdated process in your city or workplace desperately needs innovation?',
  'What’s a small change that could make a big difference in people’s health or happiness?',
  'If you could merge two existing products or services, what would they be and why?',
  'What’s a problem in your community that nobody seems to be working on yet?',
  'How could you make something more sustainable, eco-friendly, or waste-free?',
  'What’s a unique skill or knowledge you have that could be turned into a product or service?'
];

const ProductsShowcase = () => {
  const [answers, setAnswers] = useState(Array(questions.length).fill(''));
  const [points, setPoints] = useState(0);

  const handleAnswerChange = (idx, value) => {
    const next = [...answers];
    next[idx] = value;
    setAnswers(next);
  };

  const handleSubmit = () => {
    const answered = answers.filter(a => a.trim().length > 0).length;
    const earned = answered * 10; // 10 points per answered question
    setPoints(earned);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
        <div className="px-6 py-4 border-b border-border">
          <NavigationBreadcrumb />
        </div>
        <div className="max-w-3xl mx-auto px-4 lg:px-6 py-6">
          <div className="bg-card border border-border rounded-lg shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-foreground">Creativity Questions</h1>
              <div className="text-sm text-text-secondary">Points: <span className="font-semibold text-foreground">{points}</span></div>
            </div>
            <p className="text-sm text-text-secondary mb-4">Answer any questions you like. You earn 10 points per answered question.</p>
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div key={idx} className="border border-border rounded-lg p-4">
                  <div className="flex items-start space-x-2 mb-2">
                    <Icon name="HelpCircle" size={16} className="text-text-secondary mt-1" />
                    <h3 className="font-medium text-foreground">{idx + 1}. {q}</h3>
                  </div>
                  <textarea
                    value={answers[idx]}
                    onChange={(e) => handleAnswerChange(idx, e.target.value)}
                    placeholder="Your answer..."
                    className="w-full p-3 border border-border rounded-lg resize-none text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <Button variant="default" onClick={handleSubmit} iconName="CheckCircle2" iconPosition="left">Submit Answers</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsShowcase; 