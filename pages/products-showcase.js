import React from 'react';
import Head from 'next/head';
import ProductsShowcase from '../src/pages/products-showcase';

const ProductsShowcasePage = () => {
  return (
    <>
      <Head>
        <title>Products Showcase - LinkedBoard Pro</title>
        <meta name="description" content="Showcase your products and services" />
      </Head>
      <ProductsShowcase />
    </>
  );
};

export default ProductsShowcasePage;