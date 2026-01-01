import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook, Instagram, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = {
    Company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Team', href: '/#team' },
      { name: 'Careers', href: '/careers' },
      { name: 'Portfolio', href: '/#portfolio' },
    ],
    Services: [
      { name: 'Cloud Solutions', href: '/#services' },
      { name: 'Cybersecurity', href: '/#services' },
      { name: 'VoIP & Communication', href: '/#services' },
      { name: 'AI Automation', href: '/#services' },
      { name: 'Support', href: '/#contact' },
    ],
    Legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  };

  const socialLinks = [
    { icon: Linkedin, href: 'https://linkedin.com/company/philocom', color: 'hover:text-blue-400' },
    { icon: Twitter, href: 'https://twitter.com/philocom', color: 'hover:text-cyan-400' },
    { icon: Facebook, href: 'https://facebook.com/philocom', color: 'hover:text-blue-500' },
    { icon: Instagram, href: 'https://instagram.com/philocom', color: 'hover:text-pink-400' },
  ];

  return (
    <footer className="relative bg-[#030305] pt-12 md:pt-16 lg:pt-20 pb-6 md:pb-8 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 mb-8 md:mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-2 lg:col-span-2">
            <Link to="/" className="inline-block mb-4 md:mb-6">
              <h3 className="text-2xl md:text-3xl font-bold">
                <span className="text-white">PHILO</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">COM</span>
              </h3>
            </Link>

            <p className="text-gray-400 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
              Empowering businesses through innovative technology solutions. Driving digital transformation through innovation.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
              <div className="flex items-start gap-2 md:gap-3 text-gray-400 hover:text-cyan-400 transition-colors">
                <Mail className="w-4 h-4 md:w-5 md:h-5 mt-0.5 flex-shrink-0" />
                <a href="mailto:info@philocom.co">info@philocom.co</a>
              </div>
              <div className="flex items-start gap-2 md:gap-3 text-gray-400 hover:text-cyan-400 transition-colors">
                <Phone className="w-4 h-4 md:w-5 md:h-5 mt-0.5 flex-shrink-0" />
                <a href="tel:+251947447244">+251 947 447 244</a>
              </div>
              <div className="flex items-start gap-2 md:gap-3 text-gray-400">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 mt-0.5 flex-shrink-0" />
                <span>Nile Source Building, 5th Floor<br />Africa AV / Bole Road, Addis Ababa</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-bold text-base md:text-lg mb-3 md:mb-4">{category}</h4>
              <ul className="space-y-2 md:space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    {link.href.startsWith('/') && !link.href.startsWith('/#') ? (
                      <Link
                        to={link.href}
                        className="text-gray-400 hover:text-cyan-400 transition-colors text-xs md:text-sm inline-block hover:translate-x-1 transform duration-200"
                      >
                        {link.name}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-cyan-400 transition-colors text-xs md:text-sm inline-block hover:translate-x-1 transform duration-200"
                      >
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6 md:mb-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          {/* Copyright */}
          <p className="text-gray-500 text-xs md:text-sm text-center md:text-left">
            © {new Date().getFullYear()} Philocom Technology. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-3 md:gap-4">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 bg-white/5 rounded-lg border border-white/10 text-gray-400 ${social.color} transition-all duration-300 hover:scale-110 hover:border-cyan-500/50`}
                  aria-label={social.icon.name}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </a>
              );
            })}
          </div>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            className="p-2 md:p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-110"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute bottom-0 left-1/4 w-32 md:w-64 h-32 md:h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-32 md:w-64 h-32 md:h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
    </footer>
  );
};

export default Footer;
