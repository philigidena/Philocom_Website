import { Mail, Phone, MapPin, Linkedin, Twitter, Github, Facebook, Instagram, ArrowUp } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = {
    Company: [
      { name: 'About Us', href: '#about' },
      { name: 'Our Team', href: '#team' },
      { name: 'Careers', href: '#careers' },
      { name: 'Partners', href: '#partners' },
      { name: 'Press Kit', href: '#press' },
    ],
    Services: [
      { name: 'Cloud Solutions', href: '#services' },
      { name: 'IoT Development', href: '#services' },
      { name: 'Cybersecurity', href: '#services' },
      { name: 'Consulting', href: '#services' },
      { name: 'Support', href: '#contact' },
    ],
    Resources: [
      { name: 'Blog', href: '#blog' },
      { name: 'Case Studies', href: '#portfolio' },
      { name: 'Documentation', href: '#docs' },
      { name: 'API Reference', href: '#api' },
      { name: 'Community', href: '#community' },
    ],
    Legal: [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
      { name: 'Cookie Policy', href: '#cookies' },
      { name: 'GDPR', href: '#gdpr' },
      { name: 'Security', href: '#security' },
    ],
  };

  const socialLinks = [
    { icon: Linkedin, href: 'https://linkedin.com', color: 'hover:text-blue-400' },
    { icon: Twitter, href: 'https://twitter.com', color: 'hover:text-cyan-400' },
    { icon: Github, href: 'https://github.com', color: 'hover:text-gray-400' },
    { icon: Facebook, href: 'https://facebook.com', color: 'hover:text-blue-500' },
    { icon: Instagram, href: 'https://instagram.com', color: 'hover:text-pink-400' },
  ];

  return (
    <footer className="relative bg-[#030305] pt-20 pb-8 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <a href="#home" className="inline-block mb-6">
              <h3 className="text-3xl font-bold">
                <span className="text-white">PHILO</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">COM</span>
              </h3>
            </a>

            <p className="text-gray-400 mb-6 leading-relaxed">
              Empowering businesses through innovative technology solutions. Driving digital transformation through innovation.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 text-gray-400 hover:text-cyan-400 transition-colors">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <a href="mailto:info@philocom.co">info@philocom.co</a>
              </div>
              <div className="flex items-start gap-3 text-gray-400 hover:text-cyan-400 transition-colors">
                <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <a href="tel:+251947447244">+251 947 447 244</a>
              </div>
              <div className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>www.philocom.co</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-bold text-lg mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-cyan-400 transition-colors text-sm inline-block hover:translate-x-1 transform duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright */}
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Philocom Technology. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
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
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-110"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-8 border-t border-white/5">
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-40">
            <div className="text-xs text-gray-500 uppercase tracking-wider">Certified by:</div>
            <div className="text-sm text-gray-600">ISO 27001</div>
            <div className="text-sm text-gray-600">SOC 2 Type II</div>
            <div className="text-sm text-gray-600">AWS Partner</div>
            <div className="text-sm text-gray-600">GDPR Compliant</div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
    </footer>
  );
};

export default Footer;
