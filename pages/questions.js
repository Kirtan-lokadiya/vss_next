import React, { useState } from 'react';
import Head from 'next/head';
import Header from '@/src/components/ui/Header';
import NavigationBreadcrumb from '@/src/components/ui/NavigationBreadcrumb';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';

const QUESTIONS = [
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

export default function QuestionsPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(''));
  const [points, setPoints] = useState(0);

  const submitAnswer = () => {
    const answered = answers.filter(a => a.trim().length > 0).length;
    setPoints(answered * 10);
  };

  return (
    <>
      <Head>
        <title>Questions - LinkedBoard Pro</title>
      </Head>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <div className="px-6 py-4 border-b border-border">
            <NavigationBreadcrumb customBreadcrumbs={[{ label: 'Home', path: '/', icon: 'Home' }, { label: 'Questions', path: '/questions', icon: 'HelpCircle', current: true }]} />
          </div>
          <div className="h-[calc(100vh-8rem)] grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Left: Problems list + statement */}
            <div className="border-r border-border overflow-y-auto">
              <div className="p-4 flex items-center justify-between border-b border-border sticky top-0 bg-background z-10">
                <h2 className="text-lg font-semibold text-foreground">Questions</h2>
                <div className="text-sm text-text-secondary">Points: <span className="text-foreground font-semibold">{points}</span></div>
              </div>
              <div className="flex">
                <div className="w-1/3 border-r border-border max-h-[calc(100vh-12rem)] overflow-y-auto">
                  {QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      className={`w-full text-left px-3 py-2 text-sm transition-micro ${idx === selectedIndex ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'}`}
                      onClick={() => setSelectedIndex(idx)}
                    >
                      <span className="mr-2 text-xs text-text-secondary">{idx + 1}.</span> {q.slice(0, 40)}{q.length > 40 ? '…' : ''}
                    </button>
                  ))}
                </div>
                <div className="flex-1 p-4">
                  <div className="prose prose-sm max-w-none">
                    <h3 className="text-foreground font-semibold mb-2">{selectedIndex + 1}. {QUESTIONS[selectedIndex]}</h3>
                    <p className="text-text-secondary">Write a thoughtful answer on the right. You earn 10 points per answered question.</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Right: Answer editor */}
            <div className="overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">Your Answer</h3>
                  <Button variant="default" iconName="Save" iconPosition="left" onClick={submitAnswer}>Save Progress</Button>
                </div>
                <textarea
                  value={answers[selectedIndex]}
                  onChange={(e) => {
                    const next = [...answers];
                    next[selectedIndex] = e.target.value;
                    setAnswers(next);
                  }}
                  placeholder="Type your answer here..."
                  className="w-full h-[60vh] p-3 border border-border rounded-lg resize-none text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="flex justify-end mt-3">
                  <Button variant="outline" iconName="CheckCircle2" iconPosition="left" onClick={submitAnswer}>Submit</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 