import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { getQuestionById } from '@/src/utils/questionsData';

// For ideation questions we show rich details kept in the dataset

export default function QuestionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const question = useMemo(() => (id ? getQuestionById(id) : null), [id]);

  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const submitAnswer = () => {
    // Placeholder submission; wire to backend later if needed
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  if (!question) return null;

  return (
    <>
      <Head>
        <title>{question.title} - Questions</title>
      </Head>
      <div className="min-h-screen bg-background">
        <div className="h-[calc(100vh)] grid grid-cols-1 md:grid-cols-2">
          {/* Left: Statement */}
          <div className="border-r border-border overflow-y-auto">
            <div className="p-4 flex items-center justify-between border-b border-border sticky top-0 bg-background z-10">
              <div className="flex items-center gap-2">
                <Link href="/questions" className="text-sm text-blue-600 hover:underline">← Back</Link>
                <h1 className="text-lg font-semibold text-foreground">{question.title}</h1>
              </div>
              <span className={`text-sm ${question.difficulty==='Easy'?'text-emerald-500':question.difficulty==='Medium'?'text-amber-500':'text-red-500'}`}>{question.difficulty}</span>
            </div>
            <div className="p-6 prose prose-sm max-w-none">
              <p>{question.details}</p>
              <h4>Guidance</h4>
              <ul>
                <li>Clarify the problem, audience, and context.</li>
                <li>Propose a solution approach and why it is better than status quo.</li>
                <li>Consider constraints, risks, and simple validation steps.</li>
              </ul>
            </div>
          </div>

          {/* Right: Answer area */}
          <div className="overflow-y-auto">
            <div className="p-4 flex items-center justify-between border-b border-border sticky top-0 bg-background z-10">
              <h3 className="text-sm font-medium text-foreground">Your Answer</h3>
              <div className="flex gap-2">
                <button onClick={submitAnswer} className="px-3 py-1 rounded bg-primary text-white text-sm">Submit</button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <textarea
                value={answer}
                onChange={(e)=>setAnswer(e.target.value)}
                className="w-full h-[50vh] p-3 border border-border rounded-lg text-sm"
                placeholder="Write your answer here..."
              />
              {submitted && (
                <div className="border border-emerald-300 text-emerald-700 bg-emerald-50 rounded p-2 text-sm">
                  Answer submitted.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
