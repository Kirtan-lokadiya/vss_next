import React from 'react';
import Head from 'next/head';
import NotFound from '../src/pages/NotFound';

const Custom404 = () => {
  return (
    <>
      <Head>
        <title>Page Not Found - LinkedBoard Pro</title>
        <meta name="description" content="The page you are looking for could not be found" />
      </Head>
      <NotFound />
    </>
  );
};

export default Custom404;