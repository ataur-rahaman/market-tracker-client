import React from 'react';
import Banner from '../components/Banner';
import ProductSection from './ProductSection';
import AdvertisementHighlights from './AdvertisementHighlights';
import AboutUs from './AboutUs';
import ContactUs from './ContactUs';

const Home = () => {
    return (
        <div>
           <Banner></Banner>
           <ProductSection></ProductSection>
           <AdvertisementHighlights></AdvertisementHighlights>
           <AboutUs></AboutUs>
           <ContactUs></ContactUs>
        </div>
    );
};

export default Home;