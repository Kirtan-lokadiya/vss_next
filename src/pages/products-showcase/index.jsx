import React from 'react';
import Header from '@/src/components/ui/Header';

const ProductsShowcase = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
          {/* Content goes here - breadcrumb removed */}
          <div className="text-foreground">Products will be showcased here.</div>
        </div>
      </main>
    </div>
  );
};

export default ProductsShowcase; 