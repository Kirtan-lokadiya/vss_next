import React from 'react';
import Head from 'next/head';
import BlogDetailView from '../src/pages/blog-detail-view';

const BlogDetailViewPage = () => {
  return (
    <>
      <Head>
        <title>Blog Detail - LinkedBoard Pro</title>
        <meta name="description" content="Read detailed blog posts and articles" />
      </Head>
      <BlogDetailView />
    </>
  );
};

export default BlogDetailViewPage;