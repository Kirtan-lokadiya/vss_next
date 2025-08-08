import React from 'react';
import Head from 'next/head';
import ConnectionNetworkTree from '../src/pages/connection-network-tree';

const ConnectionNetworkTreePage = () => {
  return (
    <>
      <Head>
        <title>Connection Network - LinkedBoard Pro</title>
        <meta name="description" content="Visualize your professional network connections" />
      </Head>
      <ConnectionNetworkTree />
    </>
  );
};

export default ConnectionNetworkTreePage;