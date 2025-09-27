import React from 'react';
import Banner from '../components/Banner';
import ProductSection from './ProductSection';
import AdvertisementHighlights from './AdvertisementHighlights';

const Home = () => {
    return (
        <div>
           <Banner></Banner>
           <ProductSection></ProductSection>
           <AdvertisementHighlights></AdvertisementHighlights>
        </div>
    );
};

export default Home;