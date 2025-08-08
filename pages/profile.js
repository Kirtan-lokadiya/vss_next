import React from 'react';
import Head from 'next/head';
import Profile from '../src/pages/Profile';

const ProfilePage = () => {
  return (
    <>
      <Head>
        <title>Profile - LinkedBoard Pro</title>
        <meta name="description" content="Your LinkedBoard Pro profile" />
      </Head>
      <Profile />
    </>
  );
};

export default ProfilePage;