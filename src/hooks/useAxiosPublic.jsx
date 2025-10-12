import axios from 'axios';
import React from 'react';

const axiosInstance = axios.create({
    baseURL: "https://market-tracker-server-pi.vercel.app"
})

const useAxiosPublic = () => {

    return axiosInstance;
};

export default useAxiosPublic;