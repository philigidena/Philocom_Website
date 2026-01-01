import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const heroRef = useRef();
  const titleRef = useRef();
  const subtitleRef = useRef();
  const ctaRef = useRef();

  useEffect(() => {
    // Create timeline for entrance animations
    const tl = gsap.timeline({ delay: 0.5 });

    // Animate title - split reveal
    const titleChars = titleRef.current.querySelectorAll('.char');
    tl.fromTo(titleChars,
      {
        opacity: 0,
        y: 100,
        rotationX: -90,
      },
      {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 1,
        stagger: 0.05,
        ease: 'back.out(1.7)',
      }
    );

    // Animate subtitle
    tl.fromTo(subtitleRef.current,
      { opacity: 0, y: 30, filter: 'blur(10px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8 },
      '-=0.5'
    );

    // Animate CTA
    tl.fromTo(ctaRef.current.children,
      { opacity: 0, y: 20, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1 },
      '-=0.4'
    );

    // Continuous floating animation for CTA
    gsap.to('.cta-float', {
      y: -10,
      duration: 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });

    // Grid glow animation
    const gridLines = document.querySelectorAll('.grid-line');
    gridLines.forEach((line) => {
      gsap.to(line, {
        opacity: Math.random() * 0.5 + 0.3,
        duration: Math.random() * 2 + 1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * 2,
      });
    });

  }, []);

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Hero Background Image */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/Hero-background.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </div>

      {/* Animated Glowing Grid */}
      <div className="absolute inset-0 opacity-40">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path
                d="M 80 0 L 0 0 0 80"
                fill="none"
                stroke="rgba(34, 211, 238, 0.3)"
                strokeWidth="1"
                className="grid-line"
              />
            </pattern>
            <linearGradient id="grid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(34, 211, 238, 0.8)" />
              <stop offset="50%" stopColor="rgba(59, 130, 246, 0.6)" />
              <stop offset="100%" stopColor="rgba(168, 85, 247, 0.4)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Glowing accent lines */}
          {[...Array(6)].map((_, i) => (
            <line
              key={i}
              x1={`${(i + 1) * 15}%`}
              y1="0%"
              x2={`${(i + 1) * 15}%`}
              y2="100%"
              stroke="url(#grid-gradient)"
              strokeWidth="2"
              className="grid-line"
              filter="url(#glow)"
              opacity="0.3"
            />
          ))}

          {/* Horizontal glowing lines */}
          {[...Array(4)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0%"
              y1={`${(i + 1) * 20}%`}
              x2="100%"
              y2={`${(i + 1) * 20}%`}
              stroke="url(#grid-gradient)"
              strokeWidth="2"
              className="grid-line"
              filter="url(#glow)"
              opacity="0.2"
            />
          ))}
        </svg>
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">

        {/* Animated Title */}
        <div ref={titleRef} className="mb-8 perspective-1000">
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-black text-white leading-none tracking-tighter">
            {'PHILOCOM'.split('').map((char, i) => (
              <span
                key={i}
                className="char inline-block"
                style={{
                  textShadow: '0 0 40px rgba(34, 211, 238, 0.5), 0 0 80px rgba(34, 211, 238, 0.3)',
                }}
              >
                {char}
              </span>
            ))}
          </h1>
        </div>

        {/* Animated Subtitle */}
        <div ref={subtitleRef} className="mb-12">
          <div className="inline-block px-6 py-3 border border-cyan-500/50 rounded-full backdrop-blur-xl bg-cyan-500/10 mb-6">
            <span className="text-cyan-400 text-sm font-semibold tracking-widest uppercase">
              Technology & Telecommunication
            </span>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Empowering businesses through innovative technology solutions
          </p>
        </div>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-wrap justify-center gap-6 mb-20">
          <a
            href="#portfolio"
            className="cta-float group relative px-10 py-5 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 bg-size-300 animate-gradient-x text-white font-bold text-lg rounded-full overflow-hidden shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 transition-all hover:scale-105"
          >
            <span className="relative flex items-center gap-3">
              Explore Our Work
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </span>
          </a>

          <a
            href="#contact"
            className="cta-float group px-10 py-5 bg-white/10 backdrop-blur-xl text-white font-bold text-lg rounded-full border-2 border-white/30 hover:bg-white/20 hover:border-cyan-500/50 transition-all"
          >
            <span className="flex items-center gap-3">
              Start a Project
            </span>
          </a>
        </div>

        {/* Stats with glow effect */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { value: '500+', label: 'Projects' },
            { value: '200+', label: 'Clients' },
            { value: '98%', label: 'Satisfaction' },
            { value: '45+', label: 'Countries' },
          ].map((stat, i) => (
            <div
              key={i}
              className="group p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 transition-all duration-300"
            >
              <div className="text-4xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-cyan-500/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-cyan-500 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Add custom styles for animations */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .bg-size-300 {
          background-size: 300%;
        }
      `}</style>
    </section>
  );
};

export default Hero;
