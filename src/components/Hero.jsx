import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const heroRef = useRef();
  const contentRef = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main timeline
      const tl = gsap.timeline({ delay: 0.3 });

      // Animate the top label
      tl.fromTo('.hero-label',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power4.out' }
      );

      // Animate main headline with staggered words
      tl.fromTo('.hero-title-line',
        { opacity: 0, y: '2em', rotateX: -40 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1.2,
          stagger: 0.12,
          ease: 'power4.out'
        },
        '-=0.4'
      );

      // Animate description
      tl.fromTo('.hero-description',
        { opacity: 0, y: 40, filter: 'blur(10px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out' },
        '-=0.6'
      );

      // Animate CTA buttons
      tl.fromTo('.hero-cta',
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' },
        '-=0.5'
      );

      // Animate stats with counter effect
      tl.fromTo('.hero-stat',
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.1, ease: 'back.out(1.2)' },
        '-=0.4'
      );

      // Animate decorative elements
      tl.fromTo('.hero-decoration',
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 1, stagger: 0.2, ease: 'elastic.out(1, 0.5)' },
        '-=0.8'
      );

      // Animate circuit nodes
      tl.fromTo('.circuit-node',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'back.out(2)' },
        '-=1'
      );

      // Continuous floating animation for orbs
      gsap.to('.floating-orb', {
        y: 'random(-20, 20)',
        x: 'random(-15, 15)',
        duration: 'random(3, 5)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: {
          each: 0.5,
          from: 'random'
        }
      });

      // Animate glowing lines
      gsap.to('.glow-line', {
        opacity: 'random(0.3, 0.7)',
        duration: 'random(2, 4)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: {
          each: 0.3,
          from: 'random'
        }
      });

      // Pulse animation for circuit nodes
      gsap.to('.circuit-node', {
        boxShadow: '0 0 20px rgba(34, 211, 238, 0.8)',
        duration: 'random(1.5, 3)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: {
          each: 0.2,
          from: 'random'
        }
      });

      // Scroll indicator pulse
      gsap.to('.scroll-indicator', {
        y: 8,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut'
      });

    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-[#050508]"
    >
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#050508] via-[#0a0a12] to-[#050510]" />

      {/* Animated technology pattern - Circuit board style */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="circuit-gradient-h" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(34, 211, 238, 0)" />
            <stop offset="50%" stopColor="rgba(34, 211, 238, 0.3)" />
            <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
          </linearGradient>
          <linearGradient id="circuit-gradient-v" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(34, 211, 238, 0)" />
            <stop offset="50%" stopColor="rgba(34, 211, 238, 0.3)" />
            <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
          </linearGradient>
          <linearGradient id="purple-circuit" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0)" />
            <stop offset="50%" stopColor="rgba(168, 85, 247, 0.25)" />
            <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
          </linearGradient>
          <filter id="glow-filter">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Horizontal circuit lines */}
        <line x1="0" y1="15%" x2="100%" y2="15%" stroke="url(#circuit-gradient-h)" strokeWidth="1" className="glow-line" opacity="0.4" />
        <line x1="0" y1="35%" x2="100%" y2="35%" stroke="url(#purple-circuit)" strokeWidth="1" className="glow-line" opacity="0.3" />
        <line x1="0" y1="55%" x2="100%" y2="55%" stroke="url(#circuit-gradient-h)" strokeWidth="1" className="glow-line" opacity="0.35" />
        <line x1="0" y1="75%" x2="100%" y2="75%" stroke="url(#purple-circuit)" strokeWidth="1" className="glow-line" opacity="0.25" />
        <line x1="0" y1="90%" x2="100%" y2="90%" stroke="url(#circuit-gradient-h)" strokeWidth="1" className="glow-line" opacity="0.3" />

        {/* Vertical circuit lines */}
        <line x1="10%" y1="0" x2="10%" y2="100%" stroke="url(#circuit-gradient-v)" strokeWidth="1" className="glow-line" opacity="0.2" />
        <line x1="25%" y1="0" x2="25%" y2="100%" stroke="url(#circuit-gradient-v)" strokeWidth="1" className="glow-line" opacity="0.25" />
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="url(#circuit-gradient-v)" strokeWidth="1" className="glow-line" opacity="0.15" />
        <line x1="75%" y1="0" x2="75%" y2="100%" stroke="url(#circuit-gradient-v)" strokeWidth="1" className="glow-line" opacity="0.25" />
        <line x1="90%" y1="0" x2="90%" y2="100%" stroke="url(#circuit-gradient-v)" strokeWidth="1" className="glow-line" opacity="0.2" />

        {/* Diagonal accent lines */}
        <line x1="0" y1="100%" x2="30%" y2="0" stroke="url(#purple-circuit)" strokeWidth="1" className="glow-line" opacity="0.15" />
        <line x1="70%" y1="100%" x2="100%" y2="0" stroke="url(#circuit-gradient-h)" strokeWidth="1" className="glow-line" opacity="0.15" />
      </svg>

      {/* Circuit nodes (connection points) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="circuit-node absolute top-[15%] left-[10%] w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
        <div className="circuit-node absolute top-[15%] left-[25%] w-1.5 h-1.5 bg-cyan-400/80 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
        <div className="circuit-node absolute top-[35%] left-[25%] w-2.5 h-2.5 bg-purple-400 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
        <div className="circuit-node absolute top-[35%] right-[25%] w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
        <div className="circuit-node absolute top-[55%] left-[50%] w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.7)]" />
        <div className="circuit-node absolute top-[55%] right-[10%] w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.6)]" />
        <div className="circuit-node absolute top-[75%] left-[10%] w-1.5 h-1.5 bg-purple-400/80 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
        <div className="circuit-node absolute top-[75%] right-[25%] w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
        <div className="circuit-node absolute top-[90%] left-[75%] w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.6)]" />
      </div>

      {/* Hexagonal tech pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%2322d3ee' fill-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating orbs */}
      <div className="floating-orb absolute top-[10%] left-[5%] w-64 h-64 bg-cyan-500/8 rounded-full blur-3xl" />
      <div className="floating-orb absolute top-[30%] right-[10%] w-96 h-96 bg-purple-500/6 rounded-full blur-3xl" />
      <div className="floating-orb absolute bottom-[15%] left-[15%] w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="floating-orb absolute bottom-[30%] right-[20%] w-72 h-72 bg-cyan-500/6 rounded-full blur-3xl" />

      {/* Radial gradient overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(34, 211, 238, 0.03) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(168, 85, 247, 0.03) 0%, transparent 50%)'
        }}
      />

      {/* Main content */}
      <div ref={contentRef} className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-20">

        {/* Top label */}
        <div className="hero-label mb-8 md:mb-12">
          <span className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-full">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            <span className="text-sm text-gray-400 font-medium tracking-wide">Technology & Telecommunication</span>
          </span>
        </div>

        {/* Main headline */}
        <h1 className="mb-8 md:mb-10" style={{ perspective: '1000px' }}>
          <span className="hero-title-line block text-[clamp(2.2rem,7vw,5.5rem)] font-semibold text-white leading-[1.1] tracking-tight">
            Streamline Operations,
          </span>
          <span className="hero-title-line block text-[clamp(2.2rem,7vw,5.5rem)] font-semibold leading-[1.1] tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300">
              Accelerate Growth
            </span>
          </span>
          <span className="hero-title-line block text-[clamp(2.2rem,7vw,5.5rem)] font-semibold text-white leading-[1.1] tracking-tight">
            & Transform Business
          </span>
        </h1>

        {/* Description */}
        <p className="hero-description max-w-2xl text-lg md:text-xl text-gray-400 leading-relaxed mb-10 md:mb-14">
          We deliver innovative technology solutions that empower businesses to
          operate smarter, connect seamlessly, and achieve sustainable growth
          in the digital era.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 md:gap-5 mb-20 md:mb-28">
          <a
            href="#portfolio"
            className="hero-cta group relative inline-flex items-center gap-3 px-7 py-4 md:px-9 md:py-5 bg-white text-[#0a0a0f] font-semibold text-sm md:text-base rounded-full overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            <span className="relative z-10">Explore Our Work</span>
            <span className="relative z-10 flex items-center justify-center w-6 h-6 rounded-full bg-[#0a0a0f]/10 group-hover:bg-[#0a0a0f]/20 transition-colors">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </a>

          <a
            href="/contact"
            className="hero-cta group inline-flex items-center gap-3 px-7 py-4 md:px-9 md:py-5 bg-transparent text-white font-semibold text-sm md:text-base rounded-full border border-white/20 hover:border-cyan-400/50 hover:bg-white/[0.03] transition-all duration-300"
          >
            <span>Get in Touch</span>
            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </a>
        </div>

        {/* Stats section */}
        <div className="flex flex-wrap gap-8 md:gap-12 lg:gap-20">
          {[
            { value: '20+', label: 'Projects', accent: 'cyan' },
            { value: '15+', label: 'Clients', accent: 'purple' },
            { value: '3+', label: 'Countries', accent: 'emerald' },
          ].map((stat, i) => (
            <div key={i} className="hero-stat group">
              <div className="flex items-baseline gap-1 mb-2">
                <span className={`text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight ${
                  stat.accent === 'cyan' ? 'text-cyan-400' :
                  stat.accent === 'purple' ? 'text-purple-400' :
                  'text-emerald-400'
                }`}>
                  {stat.value.replace('+', '')}
                </span>
                <span className={`text-3xl md:text-4xl font-light ${
                  stat.accent === 'cyan' ? 'text-cyan-400/60' :
                  stat.accent === 'purple' ? 'text-purple-400/60' :
                  'text-emerald-400/60'
                }`}>+</span>
              </div>
              <div className="text-sm md:text-base text-gray-500 font-medium uppercase tracking-wider">
                {stat.label}
              </div>
              {/* Animated underline */}
              <div className={`h-0.5 w-0 group-hover:w-full mt-3 transition-all duration-500 ${
                stat.accent === 'cyan' ? 'bg-gradient-to-r from-cyan-400 to-transparent' :
                stat.accent === 'purple' ? 'bg-gradient-to-r from-purple-400 to-transparent' :
                'bg-gradient-to-r from-emerald-400 to-transparent'
              }`} />
            </div>
          ))}
        </div>

      </div>

      {/* Decorative corner elements */}
      <div className="hero-decoration absolute top-8 right-8 w-20 h-20 border border-white/[0.06] rounded-lg hidden lg:block" />
      <div className="hero-decoration absolute bottom-8 left-8 w-16 h-16 border border-white/[0.06] rounded-full hidden lg:block" />

      {/* Scroll indicator */}
      <div className="scroll-indicator absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        <span className="text-[10px] text-gray-500 uppercase tracking-[0.25em] font-medium">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/40 to-transparent" />
      </div>

      {/* Side brand marker */}
      <div className="hidden xl:flex absolute right-10 top-1/2 -translate-y-1/2 flex-col items-center gap-4">
        <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        <span className="text-[10px] text-gray-600 uppercase tracking-[0.2em] font-medium whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
          Philocom
        </span>
        <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      </div>

    </section>
  );
};

export default Hero;
