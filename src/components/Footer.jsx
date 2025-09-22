import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-base-200 text-base-content mt-10">
      <div className="max-w-7xl w-11/12 mx-auto py-10 px-4 grid md:grid-cols-3 gap-8">
        {/* Logo + Website Name */}
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold mb-3">
            🌟 Market Tracker
          </h2>
          <p className="text-sm text-gray-600">
            Track daily fresh produce prices and shop smarter every day.
          </p>
        </div>

        {/* Contact + Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Contact</h3>
          <p className="text-sm">📍 Dhaka, Bangladesh</p>
          <p className="text-sm">📧 support@markettracker.com</p>
          <p className="text-sm">📞 +880 1234-567890</p>
          <a
            href="/terms"
            className="block mt-3 text-sm text-primary hover:underline"
          >
            Terms & Conditions
          </a>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
          <div className="flex gap-4 text-xl">
            <a href="#" className="hover:text-primary">
              <FaFacebook />
            </a>
            <a href="#" className="hover:text-primary">
              <FaTwitter />
            </a>
            <a href="#" className="hover:text-primary">
              <FaInstagram />
            </a>
            <a href="#" className="hover:text-primary">
              <FaLinkedin />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-base-300 text-center py-4 text-sm">
        © {new Date().getFullYear()} Market Tracker. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
