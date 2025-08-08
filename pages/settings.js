import React from 'react';
import Head from 'next/head';
import Settings from '../src/pages/Settings';

const SettingsPage = () => {
  return (
    <>
      <Head>
        <title>Settings - LinkedBoard Pro</title>
        <meta name="description" content="Your LinkedBoard Pro settings" />
      </Head>
      <Settings />
    </>
  );
};

export default SettingsPage;