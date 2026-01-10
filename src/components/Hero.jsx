import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowRight, Play } from 'lucide-react';

const Hero = () => {
  const heroRef = useRef();
  const videoRef = useRef();
  const [currentWord, setCurrentWord] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  // Typewriter words
  const typewriterWords = [
    'Cloud Infrastructure',
    'Digital Transformation',
    'Enterprise Solutions',
    'Network Architecture',
    'IoT Integration',
  ];

  // Typewriter effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(false);
      setTimeout(() => {
        setCurrentWord((prev) => (prev + 1) % typewriterWords.length);
        setIsTyping(true);
      }, 500);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.5 });

      // Fade in video
      tl.fromTo(videoRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 2, ease: 'power2.out' }
      );

      // Animate the eyebrow text
      tl.fromTo('.hero-eyebrow',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=1.5'
      );

      // Split text animation for main title
      tl.fromTo('.hero-title-word',
        { opacity: 0, y: 80, rotateX: -60 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1.4,
          stagger: 0.08,
          ease: 'power4.out'
        },
        '-=0.6'
      );

      // Animate the gradient text
      tl.fromTo('.hero-gradient-text',
        { opacity: 0, scale: 0.95, filter: 'blur(20px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out' },
        '-=0.8'
      );

      // Animate typewriter line
      tl.fromTo('.hero-typewriter',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.6'
      );

      // Animate description
      tl.fromTo('.hero-description',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
        '-=0.5'
      );

      // Animate CTAs
      tl.fromTo('.hero-cta',
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.12, ease: 'back.out(1.5)' },
        '-=0.4'
      );

      // Animate side elements
      tl.fromTo('.hero-side-element',
        { opacity: 0 },
        { opacity: 1, duration: 1, stagger: 0.1, ease: 'power2.out' },
        '-=0.5'
      );

      // Continuous animations for gradient orbs
      gsap.to('.gradient-orb', {
        y: 'random(-30, 30)',
        x: 'random(-20, 20)',
        scale: 'random(0.9, 1.1)',
        duration: 'random(4, 7)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: { each: 0.5, from: 'random' }
      });

      // Scroll indicator animation
      gsap.to('.scroll-indicator-dot', {
        y: 24,
        duration: 1.5,
        repeat: -1,
        ease: 'power2.inOut'
      });

      // Floating animation for social links
      gsap.to('.social-link', {
        y: -3,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.2
      });

    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
    >
      {/* Video Background - Seamless Loop */}
      <div ref={videoRef} className="absolute inset-0 opacity-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center center' }}
        >
          <source src="/Hero_video.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Darker multi-layer gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-[#030305]/50 to-transparent" />

      {/* Radial gradient spotlight - subtle */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 30%, rgba(6, 182, 212, 0.04) 0%, transparent 60%)'
        }}
      />

      {/* Animated gradient orbs */}
      <div className="gradient-orb absolute top-[10%] left-[10%] w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[120px]" />
      <div className="gradient-orb absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-[100px]" />
      <div className="gradient-orb absolute top-[40%] right-[30%] w-[400px] h-[400px] rounded-full bg-purple-500/3 blur-[80px]" />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 pt-32 pb-20">

        {/* Eyebrow */}
        <div className="hero-eyebrow mb-8">
          <div className="group inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/[0.08] hover:border-cyan-500/30 hover:bg-white/[0.05] transition-all duration-500 cursor-default">
            <div className="relative flex items-center justify-center">
              <span className="absolute w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-75" />
              <span className="relative w-2 h-2 bg-cyan-400 rounded-full group-hover:scale-125 transition-transform duration-300" />
            </div>
            <span className="text-sm text-gray-300 font-medium tracking-wide group-hover:text-white transition-colors duration-300">
              Technology & Telecommunications Leader
            </span>
          </div>
        </div>

        {/* Main headline */}
        <h1 className="mb-6" style={{ perspective: '1000px' }}>
          <div className="overflow-hidden">
            <span className="hero-title-word inline-block text-[clamp(2.5rem,8vw,6rem)] font-bold text-white leading-[1.05] tracking-[-0.02em] hover:tracking-[-0.01em] transition-all duration-300">
              We Build&nbsp;
            </span>
          </div>
          <div className="overflow-hidden">
            <span className="hero-title-word inline-block text-[clamp(2.5rem,8vw,6rem)] font-bold text-white leading-[1.05] tracking-[-0.02em] hover:tracking-[-0.01em] transition-all duration-300">
              Tomorrow's&nbsp;
            </span>
          </div>
          <div className="overflow-hidden">
            <span className="hero-gradient-text inline-block text-[clamp(2.5rem,8vw,6rem)] font-bold leading-[1.05] tracking-[-0.02em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 hover:from-cyan-300 hover:via-blue-300 hover:to-purple-400 transition-all duration-500 cursor-default">
              Digital Future
            </span>
          </div>
        </h1>

        {/* Typewriter effect line */}
        <div className="hero-typewriter mb-8 h-12 flex items-center">
          <span className="text-xl md:text-2xl text-gray-500 font-light mr-3">Specializing in</span>
          <span
            className={`text-xl md:text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-500 ${
              isTyping ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
          >
            {typewriterWords[currentWord]}
          </span>
          <span className="w-[3px] h-7 bg-cyan-400 ml-1 animate-pulse" />
        </div>

        {/* Description */}
        <p className="hero-description max-w-2xl text-lg md:text-xl text-gray-400 leading-relaxed mb-12 hover:text-gray-300 transition-colors duration-300">
          Empowering enterprises with cutting-edge technology solutions that drive
          innovation, enhance connectivity, and accelerate digital transformation.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <a
            href="#portfolio"
            className="hero-cta group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-full overflow-hidden transition-all duration-500 hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] hover:scale-105 active:scale-100"
          >
            {/* Animated background */}
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {/* Shine effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative z-10">View Our Work</span>
            <span className="relative z-10 flex items-center justify-center w-6 h-6 rounded-full bg-white/20 group-hover:bg-white/30 group-hover:rotate-[-15deg] transition-all duration-300">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </a>

          <a
            href="/contact"
            className="hero-cta group inline-flex items-center gap-3 px-8 py-4 bg-white/[0.03] backdrop-blur-sm text-white font-semibold rounded-full border border-white/10 hover:border-cyan-400/50 hover:bg-white/[0.08] hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300"
          >
            <span className="group-hover:tracking-wide transition-all duration-300">Start a Project</span>
            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </a>

          <button className="hero-cta group flex items-center gap-3 text-gray-400 hover:text-white transition-colors duration-300">
            <span className="relative flex items-center justify-center w-12 h-12 rounded-full border border-white/20 group-hover:border-cyan-400/50 group-hover:bg-cyan-500/10 transition-all duration-300 overflow-hidden">
              {/* Pulse ring on hover */}
              <span className="absolute inset-0 rounded-full border-2 border-cyan-400/50 scale-100 opacity-0 group-hover:scale-150 group-hover:opacity-0 transition-all duration-700 group-hover:animate-ping" />
              <Play className="w-4 h-4 ml-0.5 group-hover:scale-110 transition-transform duration-300" />
            </span>
            <span className="text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">Watch Showreel</span>
          </button>
        </div>

      </div>

      {/* Scroll indicator */}
      <div className="hero-side-element absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 group cursor-pointer">
        <span className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-medium group-hover:text-cyan-400 transition-colors duration-300">Scroll</span>
        <div className="relative w-6 h-10 rounded-full border-2 border-white/20 group-hover:border-cyan-400/50 flex justify-center pt-2 transition-colors duration-300">
          <div className="scroll-indicator-dot w-1.5 h-1.5 rounded-full bg-cyan-400 group-hover:bg-cyan-300 transition-colors duration-300" />
        </div>
      </div>

      {/* Side decorative elements - Social Links */}
      <div className="hero-side-element hidden xl:block absolute left-8 top-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center gap-4">
          <div className="w-px h-20 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          <div className="flex flex-col gap-3">
            {[
              { abbr: 'Li', name: 'LinkedIn', href: 'https://linkedin.com/company/philocom' },
              { abbr: 'X', name: 'Twitter', href: 'https://twitter.com/philocom_' },
              { abbr: 'Ig', name: 'Instagram', href: 'https://www.instagram.com/philo__com' }
            ].map((social, i) => (
              <a
                key={i}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link group/social w-8 h-8 flex items-center justify-center text-[10px] font-semibold text-gray-500 hover:text-cyan-400 border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-400/10 rounded-full transition-all duration-300 hover:scale-110"
                title={social.name}
              >
                <span className="group-hover/social:scale-110 transition-transform duration-200">{social.abbr}</span>
              </a>
            ))}
          </div>
          <div className="w-px h-20 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        </div>
      </div>

      {/* Right side brand marker */}
      <div className="hero-side-element hidden xl:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col items-center gap-4">
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        <span
          className="text-[10px] text-gray-600 uppercase tracking-[0.25em] font-medium hover:text-cyan-400 transition-colors duration-300 cursor-default"
          style={{ writingMode: 'vertical-rl' }}
        >
          Philocom.co
        </span>
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      </div>

    </section>
  );
};

export default Hero;
