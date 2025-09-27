// components/ContactUs.jsx
import React from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const ContactUs = () => {
  return (
    <div className="bg-base-100 py-12 px-6">
      <h2 className="text-3xl font-bold mb-6 text-center">📞 Contact Us</h2>
      <p className="text-center text-gray-600 mb-8">
        Have questions, feedback, or partnership ideas?  
        We’d love to hear from you!
      </p>
      <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="p-6 bg-base-200 rounded text-center">
          <FaPhoneAlt className="text-primary text-2xl mb-2 mx-auto" />
          <h3 className="font-semibold">Phone</h3>
          <p className="text-gray-700">+880 123 456 789</p>
        </div>
        <div className="p-6 bg-base-200 rounded text-center">
          <FaEnvelope className="text-primary text-2xl mb-2 mx-auto" />
          <h3 className="font-semibold">Email</h3>
          <p className="text-gray-700">support@markettracker.com</p>
        </div>
        <div className="p-6 bg-base-200 rounded text-center">
          <FaMapMarkerAlt className="text-primary text-2xl mb-2 mx-auto" />
          <h3 className="font-semibold">Location</h3>
          <p className="text-gray-700">Dhaka, Bangladesh</p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
