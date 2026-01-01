import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/#home' },
    { name: 'About', href: '/#about' },
    { name: 'Portfolio', href: '/#portfolio' },
    { name: 'Services', href: '/#services' },
    { name: 'Team', href: '/#team' },
    { name: 'Contact', href: '/#contact' },
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    // Check if it's a hash link
    if (href.includes('#')) {
      const [path, hash] = href.split('#');

      // If we're not on the home page, navigate there first
      if (location.pathname !== '/' && (path === '/' || path === '')) {
        navigate('/');
        // Wait for navigation, then scroll
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 100);
      } else {
        // Already on home page, just scroll
        const element = document.getElementById(hash);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    }
  };

  return (
    <>
      {/* Main Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-[#030305]/80 backdrop-blur-2xl border-b border-white/10 py-3 md:py-4'
            : 'bg-transparent py-4 md:py-6'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center group"
            >
              <img
                src="/philocom_logo_white.png"
                alt="Philocom Logo"
                className="h-8 md:h-10 lg:h-12 w-auto group-hover:scale-105 transition-transform duration-300"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="relative text-gray-300 hover:text-white text-sm font-medium tracking-wide transition-colors duration-300 group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href="/#contact"
                onClick={(e) => handleNavClick(e, '/#contact')}
                className="px-5 py-2 xl:px-6 xl:py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-semibold rounded-full hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105"
              >
                Get Started
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:text-cyan-400 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>

        {/* Menu Content */}
        <div
          className={`absolute top-0 right-0 w-full max-w-sm h-full bg-[#030305] border-l border-white/10 p-6 md:p-8 transform transition-transform duration-500 ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col gap-4 md:gap-6 mt-16 md:mt-20">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-xl md:text-2xl font-semibold text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300"
              >
                {link.name}
              </a>
            ))}

            <a
              href="/#contact"
              onClick={(e) => handleNavClick(e, '/#contact')}
              className="mt-6 md:mt-8 px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-center text-base md:text-lg font-bold rounded-full hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
