import { useEffect, useRef, useState } from 'react';
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook, Instagram, ArrowRight, ArrowUpRight, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const footerRef = useRef();
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState(null);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setSubscribeStatus('invalid');
      setTimeout(() => setSubscribeStatus(null), 3000);
      return;
    }
    // Simulate newsletter subscription
    setSubscribeStatus('success');
    setEmail('');
    setTimeout(() => setSubscribeStatus(null), 5000);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate CTA section
      gsap.fromTo('.footer-cta',
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
          }
        }
      );

      // Animate footer columns
      gsap.fromTo('.footer-column',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.footer-content',
            start: 'top 85%',
          }
        }
      );

      // Animate bottom bar
      gsap.fromTo('.footer-bottom',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
          delay: 0.3,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.footer-bottom',
            start: 'top 95%',
          }
        }
      );

      // Marquee animation
      gsap.to('.marquee-content', {
        xPercent: -50,
        duration: 20,
        repeat: -1,
        ease: 'none',
      });

      // Giant text parallax
      gsap.to('.giant-text', {
        y: -100,
        ease: 'none',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        }
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

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
    ],
    Legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  };

  const socialLinks = [
    { icon: Linkedin, href: 'https://linkedin.com/company/philocom', label: 'Li' },
    { icon: Twitter, href: 'https://twitter.com/philocom_', label: 'X' },
    { icon: Instagram, href: 'https://www.instagram.com/philo__com', label: 'Ig' },
  ];

  return (
    <footer ref={footerRef} className="relative bg-[#030305] overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      {/* Giant Background Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none overflow-visible w-full">
        <span
          className="giant-text block text-center text-[25vw] md:text-[20vw] lg:text-[18vw] font-black text-white/[0.02] tracking-tighter select-none whitespace-nowrap"
          style={{
            WebkitTextStroke: '2px rgba(6,182,212,0.06)',
          }}
        >
          PHILOCOM
        </span>
      </div>

      {/* Large CTA Section */}
      <div className="footer-cta relative pt-32 pb-24 px-6">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/8 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 tracking-tight">
              Let's Build
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Something Great
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Ready to transform your business with cutting-edge technology? Let's start a conversation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contact"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-full hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] transition-all duration-500 hover:scale-105"
              >
                <span>Start a Project</span>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
              <a
                href="mailto:info@philocom.co"
                className="group inline-flex items-center gap-2 px-8 py-4 text-gray-400 hover:text-white font-medium transition-colors"
              >
                <span>info@philocom.co</span>
                <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Section */}
      <div className="relative py-8 border-y border-white/[0.06] overflow-hidden">
        <div className="marquee-content flex whitespace-nowrap">
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="flex items-center gap-16 px-8">
              {['Cloud Solutions', 'Cybersecurity', 'IoT', 'VoIP', 'AI Automation', 'System Design', 'ERP & CRM', 'IT Support'].map((item, i) => (
                <span key={i} className="flex items-center gap-4 text-2xl md:text-3xl font-bold text-white/10 hover:text-white/20 transition-colors cursor-default">
                  <span className="w-2 h-2 rounded-full bg-cyan-500/50" />
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="footer-content py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Brand & Newsletter Column */}
            <div className="footer-column lg:col-span-5 space-y-8">
              <Link to="/" className="inline-block group">
                <h3 className="text-4xl font-bold">
                  <span className="text-white group-hover:text-gray-300 transition-colors">PHILO</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">COM</span>
                </h3>
              </Link>

              <p className="text-gray-400 leading-relaxed max-w-md">
                Empowering businesses through innovative technology solutions. Driving digital transformation with cutting-edge expertise since 2017.
              </p>

              {/* Newsletter */}
              <div className="space-y-4">
                <h4 className="text-white font-semibold">Stay Updated</h4>
                <form onSubmit={handleNewsletterSubmit} className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={`w-full px-5 py-4 pr-14 bg-white/[0.03] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all ${
                      subscribeStatus === 'invalid' ? 'border-red-500/50' : 'border-white/10'
                    }`}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center hover:shadow-lg hover:shadow-cyan-500/25 transition-all hover:scale-105"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </form>
                {subscribeStatus === 'success' && (
                  <p className="text-cyan-400 text-sm">Thanks for subscribing!</p>
                )}
                {subscribeStatus === 'invalid' && (
                  <p className="text-red-400 text-sm">Please enter a valid email</p>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-3 pt-4">
                <a href="mailto:info@philocom.co" className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:border-cyan-500/30 group-hover:bg-cyan-500/5 transition-all">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm">info@philocom.co</span>
                </a>
                <a href="tel:+251947447244" className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:border-cyan-500/30 group-hover:bg-cyan-500/5 transition-all">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-sm">+251 947 447 244</span>
                </a>
                <div className="group flex items-start gap-3 text-gray-400">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-sm pt-2.5">Nile Source Building, 5th Floor<br />Africa AV / Bole Road, Addis Ababa</span>
                </div>
              </div>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
                {Object.entries(footerLinks).map(([category, links]) => (
                  <div key={category} className="footer-column">
                    <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-6">
                      {category}
                    </h4>
                    <ul className="space-y-4">
                      {links.map((link, index) => (
                        <li key={index}>
                          {link.href.startsWith('/') && !link.href.startsWith('/#') ? (
                            <Link
                              to={link.href}
                              className="group text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center gap-2"
                            >
                              <span className="w-0 h-px bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-4 transition-all duration-300" />
                              {link.name}
                            </Link>
                          ) : (
                            <a
                              href={link.href}
                              className="group text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center gap-2"
                            >
                              <span className="w-0 h-px bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-4 transition-all duration-300" />
                              {link.name}
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Philocom Technology. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/[0.05] border border-transparent group-hover:border-white/10 transition-all duration-300" />
                  <social.icon className="relative z-10 w-4 h-4" />
                </a>
              ))}
            </div>

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              className="group flex items-center gap-2 text-gray-500 hover:text-white text-sm transition-colors"
            >
              <span>Back to top</span>
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10 transition-all">
                <ArrowRight className="w-3 h-3 -rotate-90 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
