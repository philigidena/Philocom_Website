import { useEffect, useRef } from 'react';
import { Calendar, Target, Lightbulb, Settings, ArrowRight, Zap, Globe, Shield } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const sectionRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Data Stream Animation
      const streams = gsap.utils.toArray('.data-stream');
      streams.forEach((stream) => {
        gsap.to(stream, {
          y: '100%',
          duration: 2 + Math.random() * 2,
          repeat: -1,
          ease: 'none',
          delay: Math.random() * 2,
        });
      });

      // Parallax for background orbs
      gsap.to('.about-bg-orb', {
        y: -80,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        }
      });

      // Eyebrow animation
      gsap.fromTo('.about-eyebrow',
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
          },
        }
      );

      // Title words animation with split effect
      gsap.fromTo('.about-title-line',
        { opacity: 0, y: 60, rotateX: -45 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
          },
        }
      );

      // Description fade in
      gsap.fromTo('.about-description',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
          },
        }
      );

      // CTA button
      gsap.fromTo('.about-cta',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 70%',
          },
        }
      );

      // Highlight cards staggered reveal
      gsap.fromTo('.highlight-card',
        { opacity: 0, y: 80, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.highlights-grid',
            start: 'top 80%',
          },
        }
      );

      // Counter animation for values
      const counters = document.querySelectorAll('.counter-value');
      counters.forEach((counter) => {
        const target = counter.dataset.value;
        gsap.fromTo(counter,
          { textContent: '0' },
          {
            textContent: target,
            duration: 2,
            ease: 'power2.out',
            snap: { textContent: 1 },
            scrollTrigger: {
              trigger: counter,
              start: 'top 85%',
            },
          }
        );
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const highlights = [
    {
      icon: Calendar,
      label: 'Founded',
      value: '2017',
      numericValue: 2017,
      desc: 'Years of innovation',
      gradient: 'from-cyan-400 to-cyan-600'
    },
    {
      icon: Globe,
      label: 'Reach',
      value: 'Global',
      desc: 'Digital Transformation',
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      icon: Zap,
      label: 'Projects',
      value: '50+',
      numericValue: 50,
      desc: 'Successfully Delivered',
      gradient: 'from-blue-500 to-blue-700'
    },
    {
      icon: Shield,
      label: 'Uptime',
      value: '99.9%',
      desc: 'Service Reliability',
      gradient: 'from-blue-600 to-cyan-500'
    },
  ];

  return (
    <section ref={sectionRef} className="relative py-32 px-6 bg-[#030305] overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Grid Overlay for Texture */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Background Orbs with Parallax */}
      <div className="about-bg-orb absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px]" />
      <div className="about-bg-orb absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />

      {/* Background Data Streams */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="data-stream absolute w-[1px] h-[200px] bg-gradient-to-b from-transparent via-cyan-500 to-transparent"
            style={{
              left: `${5 + i * 8}%`,
              top: '-200px',
              opacity: 0.2 + Math.random() * 0.4,
            }}
          />
        ))}
      </div>

      <div ref={containerRef} className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* Left: Typography & Story */}
          <div className="space-y-10">
            <div className="about-eyebrow flex items-center gap-4">
              <div className="w-12 h-px bg-gradient-to-r from-cyan-400 to-transparent" />
              <span className="text-sm font-semibold text-cyan-400 tracking-widest uppercase">Our Story</span>
            </div>

            <div style={{ perspective: '1000px' }}>
              <h2 className="about-title-line text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                Architecting the
              </h2>
              <h2 className="about-title-line text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
                Digital Future
              </h2>
            </div>

            <div className="space-y-6">
              <p className="about-description text-lg text-gray-400 leading-relaxed">
                Founded in <span className="text-white font-semibold">2017</span>, PHILOCOM has evolved from a visionary startup into a powerhouse of technological innovation. We don't just adapt to change; we drive it.
              </p>
              <p className="about-description text-lg text-gray-400 leading-relaxed">
                By integrating cutting-edge <span className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-default">IoT ecosystems</span>, robust <span className="text-blue-400 hover:text-blue-300 transition-colors cursor-default">cybersecurity frameworks</span>, and scalable cloud solutions, we empower organizations to navigate the complexities of the modern digital landscape with absolute confidence.
              </p>
            </div>

            <div className="about-cta pt-4">
              <a
                href="/about"
                className="group inline-flex items-center gap-3 px-6 py-3 bg-white/[0.03] backdrop-blur-sm text-white font-semibold rounded-full border border-white/10 hover:border-cyan-500/50 hover:bg-white/[0.06] transition-all duration-300"
              >
                <span className="group-hover:tracking-wide transition-all duration-300">Read Full Story</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                </div>
              </a>
            </div>
          </div>

          {/* Right: Premium Grid Layout */}
          <div className="highlights-grid grid grid-cols-2 gap-5">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="highlight-card group relative"
                >
                  {/* Gradient border effect */}
                  <div className={`absolute -inset-[1px] bg-gradient-to-r ${item.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`} />
                  <div className={`absolute -inset-[1px] bg-gradient-to-r ${item.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  {/* Card content */}
                  <div className="relative p-7 rounded-2xl bg-[#0a0a0f] border border-white/[0.06] group-hover:border-transparent transition-all duration-500 h-full">
                    {/* Gradient accent on hover */}
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 rounded-bl-[60px] transition-opacity duration-500`} />

                    {/* Animated line */}
                    <div className={`absolute left-0 top-0 w-1 h-0 bg-gradient-to-b ${item.gradient} group-hover:h-full transition-all duration-700 rounded-l-2xl`} />

                    <div className="relative z-10">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} p-[1px] mb-5`}>
                        <div className="w-full h-full rounded-xl bg-[#0a0a0f] flex items-center justify-center group-hover:bg-transparent transition-colors duration-500">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      {/* Value */}
                      <div className="text-3xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                        {item.value}
                      </div>

                      {/* Label */}
                      <div className={`text-sm font-semibold uppercase tracking-wider mb-1 text-transparent bg-clip-text bg-gradient-to-r ${item.gradient}`}>
                        {item.label}
                      </div>

                      {/* Description */}
                      <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
