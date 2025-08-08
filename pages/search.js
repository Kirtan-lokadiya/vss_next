import React from 'react';
import Head from 'next/head';
import GoogleSearch from '../src/pages/GoogleSearch';

const SearchPage = () => {
  return (
    <>
      <Head>
        <title>Search - LinkedBoard Pro</title>
        <meta name="description" content="Search functionality for LinkedBoard Pro" />
      </Head>
      <GoogleSearch />
    </>
  );
};

export default SearchPage;