import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import Header from '@/src/components/ui/Header';
import Button from '@/src/components/ui/Button';
import Link from 'next/link';
import { QUESTIONS } from '@/src/utils/questionsData';

export default function QuestionsPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return QUESTIONS.filter(q => q.title.toLowerCase().includes(search.toLowerCase()));
  }, [filter, search]);

  return (
    <>
      <Head>
        <title>Questions - VSS</title>
      </Head>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          {/* Breadcrumb removed for single navbar */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <input className="border border-border rounded px-2 py-1 text-sm" placeholder="Search..." value={search} onChange={(e)=>setSearch(e.target.value)} />
            </div>

            <div className="overflow-hidden rounded-lg border border-border">
              <div className="grid grid-cols-12 bg-muted px-3 py-2 text-xs text-text-secondary">
                <div className="col-span-1">Select</div>
                <div className="col-span-11">Prompt</div>
              </div>
              <div>
                {filtered.map((q, idx) => (
                  <div key={q.id} className="grid grid-cols-12 items-center px-3 py-3 border-t border-border hover:bg-muted/50">
                    <div className="col-span-1">
                      <input type="checkbox" className="h-4 w-4" />
                    </div>
                    <div className="col-span-11">
                      <Link href={`/questions/${q.id}`} className="text-blue-600 hover:underline text-sm">{q.title}</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 