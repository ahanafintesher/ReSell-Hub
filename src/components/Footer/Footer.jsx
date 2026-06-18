// components/Footer.jsx
import Link from 'next/link';
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedinIn, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt 
} from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Information */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">ReSell Hub</h2>
            <p className="text-sm leading-relaxed">
              Your trusted marketplace for buying and selling quality pre-owned items. 
              Find great deals and give items a second life.
            </p>
            <div className="flex space-x-4 pt-2">
              {/* Social Media Links */}
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 transition-colors duration-300"
                aria-label="Facebook"
              >
                <FaFacebookF className="w-4 h-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-sky-500 transition-colors duration-300"
                aria-label="Twitter"
              >
                <FaTwitter className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-pink-600 transition-colors duration-300"
                aria-label="Instagram"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-blue-700 transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-white transition-colors duration-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors duration-300">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:text-white transition-colors duration-300">
                  Sell Your Items
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors duration-300">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors duration-300">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Customer Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors duration-300">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors duration-300">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors duration-300">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors duration-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors duration-300">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaMapMarkerAlt className="w-5 h-5 mt-1 flex-shrink-0 text-blue-500" />
                <span className="text-sm">
                  123 Market Street<br />
                  New York, NY 10001<br />
                  United States
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <FaPhone className="w-5 h-5 flex-shrink-0 text-blue-500" />
                <a href="tel:+1234567890" className="text-sm hover:text-white transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <FaEnvelope className="w-5 h-5 flex-shrink-0 text-blue-500" />
                <a href="mailto:support@resellhub.com" className="text-sm hover:text-white transition-colors">
                  support@resellhub.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Copyright Section */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="text-sm text-gray-400">
              © {currentYear} ReSell Hub. All rights reserved.
            </div>
            <div className="mt-4 md:mt-0">
              <ul className="flex flex-wrap space-x-6 text-sm text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-white transition-colors">
                    Cookies
                  </Link>
                </li>
                <li>
                  <Link href="/sitemap" className="hover:text-white transition-colors">
                    Sitemap
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;