import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight, ArrowDown } from 'lucide-react';

const Hero = () => {
  const heroRef = useRef();
  const titleRef = useRef();
  const subtitleRef = useRef();
  const ctaRef = useRef();
  const statsRef = useRef();

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    // Animate the line
    tl.fromTo('.hero-line',
      { scaleX: 0 },
      { scaleX: 1, duration: 1.2, ease: 'power3.out' }
    );

    // Animate title words
    tl.fromTo('.title-word',
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
      '-=0.8'
    );

    // Animate subtitle
    tl.fromTo(subtitleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 },
      '-=0.4'
    );

    // Animate CTA
    tl.fromTo(ctaRef.current.children,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
      '-=0.3'
    );

    // Animate stats
    tl.fromTo('.stat-item',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
      '-=0.2'
    );

  }, []);

  const scrollToContent = () => {
    const element = document.getElementById('stats');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#030305]"
    >
      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Minimal gradient accent */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-cyan-500/5 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-blue-500/5 via-transparent to-transparent" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16">

        {/* Top accent line */}
        <div className="hero-line w-16 h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 mb-8 origin-left" />

        {/* Title */}
        <div ref={titleRef} className="mb-6 md:mb-8">
          <h1 className="text-[clamp(2.5rem,8vw,7rem)] font-light text-white leading-[0.95] tracking-tight">
            <span className="title-word block overflow-hidden">
              <span className="inline-block">Technology</span>
            </span>
            <span className="title-word block overflow-hidden">
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Solutions</span>
            </span>
            <span className="title-word block overflow-hidden text-gray-500 text-[clamp(1.5rem,4vw,3.5rem)]">
              <span className="inline-block">for Modern Business</span>
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <div ref={subtitleRef} className="max-w-xl mb-10 md:mb-14">
          <p className="text-gray-400 text-base md:text-lg leading-relaxed">
            We craft innovative technology and telecommunication solutions that
            transform how businesses operate and connect.
          </p>
        </div>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-wrap gap-4 mb-20 md:mb-28">
          <a
            href="#portfolio"
            className="group flex items-center gap-3 px-6 py-3.5 bg-white text-black font-medium text-sm rounded-full hover:bg-gray-100 transition-all duration-300"
          >
            View Our Work
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          <a
            href="#contact"
            className="group flex items-center gap-3 px-6 py-3.5 text-white font-medium text-sm rounded-full border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300"
          >
            Get in Touch
          </a>
        </div>

        {/* Minimal Stats */}
        <div ref={statsRef} className="flex flex-wrap gap-x-12 gap-y-6 md:gap-x-16 lg:gap-x-24">
          {[
            { value: '20+', label: 'Projects Delivered' },
            { value: '15+', label: 'Happy Clients' },
            { value: '3+', label: 'Countries Served' },
          ].map((stat, i) => (
            <div key={i} className="stat-item">
              <div className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-1">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-gray-500 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 hover:text-white transition-colors cursor-pointer group"
      >
        <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
        <ArrowDown className="w-4 h-4 animate-bounce" />
      </button>

      {/* Side text decoration */}
      <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center gap-4">
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-gray-700 to-transparent" />
          <span className="text-[10px] text-gray-600 uppercase tracking-[0.3em] writing-mode-vertical rotate-180" style={{ writingMode: 'vertical-rl' }}>
            Philocom Technology
          </span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-gray-700 to-transparent" />
        </div>
      </div>

    </section>
  );
};

export default Hero;
