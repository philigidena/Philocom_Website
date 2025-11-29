import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight, Globe, Shield } from 'lucide-react';

const Hero = () => {
  const heroRef = useRef();
  const contentRef = useRef();

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Initial reveal animation
    tl.fromTo(contentRef.current.children,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.1 }
    );
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#030305]"
    >
      {/* 1. Dynamic Background Layers (Aurora Effect) */}
      <div className="aurora-bg">
        <div className="aurora-blob aurora-blob-1"></div>
        <div className="aurora-blob aurora-blob-2"></div>
        <div className="aurora-blob aurora-blob-3"></div>

        {/* Grid Overlay for Texture */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* 2. Main Content Container */}
      <div className="relative z-10 container mx-auto px-6">
        <div ref={contentRef} className="flex flex-col items-center text-center max-w-5xl mx-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 hover:bg-white/10 transition-colors cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-sm font-medium text-cyan-300 tracking-wider uppercase">Future of Connectivity</span>
          </div>

          {/* Main Title - PURE WHITE & HUGE */}
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-white mb-6 leading-[0.9]">
            PHILO<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">COM</span>
          </h1>

          <p className="text-2xl md:text-3xl font-light text-gray-300 mb-10 tracking-wide">
            Technology & Telecommunication
          </p>

          {/* Description - High Contrast */}
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            We engineer robust <span className="text-white font-semibold">IoT ecosystems</span>,
            fortify businesses with <span className="text-white font-semibold">cybersecurity</span>,
            and drive global <span className="text-white font-semibold">digital transformation</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-6">
            <button className="group relative px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden transition-all hover:scale-105">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-300 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center gap-2 group-hover:text-white transition-colors">
                Explore Solutions <ArrowRight className="w-5 h-5" />
              </span>
            </button>

            <button className="px-8 py-4 bg-white/5 text-white font-medium rounded-full border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
              Contact Us
            </button>
          </div>

          {/* Floating Glass Cards (Decorative) */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 hidden xl:block -translate-x-20">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md w-64 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
              <Globe className="w-8 h-8 text-cyan-400 mb-4" />
              <div className="text-2xl font-bold text-white mb-1">100+</div>
              <div className="text-sm text-gray-400">Global Projects Delivered</div>
            </div>
          </div>

          <div className="absolute top-1/2 -translate-y-1/2 right-0 hidden xl:block translate-x-20">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md w-64 transform rotate-6 hover:rotate-0 transition-transform duration-500">
              <Shield className="w-8 h-8 text-blue-400 mb-4" />
              <div className="text-2xl font-bold text-white mb-1">24/7</div>
              <div className="text-sm text-gray-400">Secure Support System</div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#030305] to-transparent z-10"></div>
    </section>
  );
};

export default Hero;
