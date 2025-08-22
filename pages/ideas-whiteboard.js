import React from 'react';
import Head from 'next/head';
import IdeasWhiteboard from '../src/pages/ideas-whiteboard';

const IdeasWhiteboardPage = () => {
  return (
    <>
      <Head>
        <title>VSS - Ideas Whiteboard</title>
        <meta name="description" content="Collaborative whiteboard for brainstorming and idea sharing" />
      </Head>
      <IdeasWhiteboard />
    </>
  );
};

export default IdeasWhiteboardPage;