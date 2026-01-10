import { useEffect, useRef, useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, Award, Zap, Users, CheckCircle } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ClientsTestimonials = () => {
  const sectionRef = useRef();
  const headerRef = useRef();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const clients = [
    { name: 'TechCorp', initials: 'TC', gradient: 'from-cyan-400 to-cyan-600' },
    { name: 'InnovateCo', initials: 'IC', gradient: 'from-cyan-500 to-blue-600' },
    { name: 'CloudSystems', initials: 'CS', gradient: 'from-blue-500 to-blue-700' },
    { name: 'DataFlow', initials: 'DF', gradient: 'from-blue-600 to-cyan-500' },
    { name: 'SecureNet', initials: 'SN', gradient: 'from-cyan-500 to-blue-500' },
    { name: 'IoTech', initials: 'IT', gradient: 'from-blue-400 to-cyan-500' },
  ];

  const testimonials = [
    {
      name: 'Michael Rodriguez',
      role: 'CTO, TechCorp',
      company: 'TechCorp',
      initials: 'MR',
      rating: 5,
      text: 'Philocom transformed our infrastructure completely. The cloud migration was seamless, and our operational costs dropped by 40% while performance improved dramatically. Their team is exceptionally professional.',
      project: 'Cloud Infrastructure Modernization',
      gradient: 'from-cyan-400 to-cyan-600'
    },
    {
      name: 'Jennifer Liu',
      role: 'VP of Engineering, InnovateCo',
      company: 'InnovateCo',
      initials: 'JL',
      rating: 5,
      text: 'The IoT solution they built handles 50,000 devices effortlessly. Real-time monitoring and predictive maintenance have revolutionized our operations. Couldn\'t ask for a better partner.',
      project: 'Enterprise IoT Platform',
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      name: 'David Thompson',
      role: 'CEO, SecureNet',
      company: 'SecureNet',
      initials: 'DT',
      rating: 5,
      text: 'Their cybersecurity expertise is unmatched. They identified and patched vulnerabilities we didn\'t even know existed. Our security posture has never been stronger. Highly recommended!',
      project: 'Security Audit & Hardening',
      gradient: 'from-blue-500 to-blue-700'
    },
    {
      name: 'Sarah Chen',
      role: 'Director of IT, CloudSystems',
      company: 'CloudSystems',
      initials: 'SC',
      rating: 5,
      text: 'From day one, Philocom showed deep understanding of our needs. The custom solution they developed exceeded our expectations. Response time and technical support are outstanding.',
      project: 'Custom SaaS Platform Development',
      gradient: 'from-blue-600 to-cyan-500'
    },
  ];

  const stats = [
    { icon: CheckCircle, value: '98%', label: 'Client Satisfaction', gradient: 'from-cyan-400 to-cyan-600' },
    { icon: Users, value: '30+', label: 'Happy Clients', gradient: 'from-cyan-500 to-blue-600' },
    { icon: Zap, value: '50+', label: 'Projects Delivered', gradient: 'from-blue-500 to-blue-700' },
  ];

  // Auto-play testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax for background orbs
      gsap.to('.testimonials-bg-orb', {
        y: -80,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        }
      });

      // Header animations
      gsap.fromTo('.testimonials-eyebrow',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
          }
        }
      );

      gsap.fromTo('.testimonials-title',
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 80%',
          }
        }
      );

      gsap.fromTo('.testimonials-subtitle',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 80%',
          }
        }
      );

      // Client logos animation
      gsap.fromTo('.client-logo',
        { opacity: 0, scale: 0.8, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: '.clients-grid',
            start: 'top 80%',
          },
        }
      );

      // Testimonial card animation
      gsap.fromTo('.testimonial-card',
        { opacity: 0, y: 60, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.testimonial-card',
            start: 'top 80%',
          },
        }
      );

      // Stats animation
      gsap.fromTo('.stat-item',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.stats-grid',
            start: 'top 85%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const currentTestimonial = testimonials[activeTestimonial];

  return (
    <section
      ref={sectionRef}
      className="py-32 px-6 bg-[#030305] relative overflow-hidden"
    >
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Background Orbs */}
      <div className="testimonials-bg-orb absolute top-[30%] left-[-10%] w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[150px]" />
      <div className="testimonials-bg-orb absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div ref={headerRef} className="text-center mb-16">
          <div className="testimonials-eyebrow inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 mb-6">
            <Award className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-medium text-pink-400 tracking-wider uppercase">
              Client Success
            </span>
          </div>

          <h2 className="testimonials-title text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Trusted by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
              Industry Leaders
            </span>
          </h2>

          <p className="testimonials-subtitle text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Join hundreds of satisfied clients who have transformed their businesses with our solutions.
          </p>
        </div>

        {/* Client Logos */}
        <div className="clients-grid mb-20">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {clients.map((client, index) => (
              <div
                key={index}
                className="client-logo group relative"
              >
                {/* Gradient border effect */}
                <div className={`absolute -inset-[1px] bg-gradient-to-r ${client.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`} />
                <div className={`absolute -inset-[1px] bg-gradient-to-r ${client.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative p-6 bg-[#0a0a0f] rounded-2xl border border-white/[0.06] group-hover:border-transparent transition-all duration-500 flex items-center justify-center h-20">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${client.gradient} p-[1px]`}>
                      <div className="w-full h-full rounded-xl bg-[#0a0a0f] flex items-center justify-center group-hover:bg-transparent transition-colors duration-500">
                        <span className="text-sm font-bold text-white">{client.initials}</span>
                      </div>
                    </div>
                    <span className="text-gray-400 font-medium group-hover:text-white transition-colors duration-300 hidden md:block">
                      {client.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Carousel */}
        <div className="max-w-5xl mx-auto">
          <div className="testimonial-card relative group">
            {/* Gradient border effect */}
            <div className={`absolute -inset-[1px] bg-gradient-to-r ${currentTestimonial.gradient} rounded-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 blur-sm`} />
            <div className={`absolute -inset-[1px] bg-gradient-to-r ${currentTestimonial.gradient} rounded-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-500`} />

            {/* Main Testimonial Card */}
            <div className="relative bg-[#0a0a0f] rounded-3xl p-8 md:p-12 border border-white/[0.06] group-hover:border-transparent transition-all duration-500">
              {/* Quote Icon */}
              <div className="absolute top-8 right-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <Quote className="w-24 h-24 text-cyan-400" />
              </div>

              {/* Background gradient accent */}
              <div className={`absolute top-0 right-0 w-60 h-60 bg-gradient-to-br ${currentTestimonial.gradient} opacity-0 group-hover:opacity-5 rounded-bl-[100px] transition-opacity duration-500`} />

              <div className="relative z-10">
                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8 font-light">
                  "{currentTestimonial.text}"
                </p>

                {/* Project Badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${currentTestimonial.gradient} bg-opacity-10 border border-white/10 rounded-full mb-8`}>
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-gray-300 font-medium">Project: {currentTestimonial.project}</span>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentTestimonial.gradient} p-[2px]`}>
                    <div className="w-full h-full rounded-2xl bg-[#0a0a0f] flex items-center justify-center">
                      <span className="text-xl font-bold text-white">{currentTestimonial.initials}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">{currentTestimonial.name}</h4>
                    <p className={`text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r ${currentTestimonial.gradient}`}>
                      {currentTestimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="group/btn relative w-12 h-12 flex items-center justify-center"
                aria-label="Previous testimonial"
              >
                <div className="absolute inset-0 rounded-full border border-white/10 group-hover/btn:border-cyan-500/50 group-hover/btn:bg-cyan-500/10 transition-all duration-300" />
                <ChevronLeft className="w-5 h-5 text-gray-400 group-hover/btn:text-white group-hover/btn:-translate-x-0.5 transition-all duration-300" />
              </button>

              {/* Dots Indicator */}
              <div className="flex gap-3">
                {testimonials.map((t, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveTestimonial(index);
                      setIsAutoPlaying(false);
                    }}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      index === activeTestimonial
                        ? `bg-gradient-to-r ${t.gradient} w-10`
                        : 'bg-white/20 hover:bg-white/40 w-2'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="group/btn relative w-12 h-12 flex items-center justify-center"
                aria-label="Next testimonial"
              >
                <div className="absolute inset-0 rounded-full border border-white/10 group-hover/btn:border-cyan-500/50 group-hover/btn:bg-cyan-500/10 transition-all duration-300" />
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover/btn:text-white group-hover/btn:translate-x-0.5 transition-all duration-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Trust Stats */}
        <div className="stats-grid grid md:grid-cols-3 gap-6 mt-20">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="stat-item group relative"
              >
                {/* Gradient border effect */}
                <div className={`absolute -inset-[1px] bg-gradient-to-r ${stat.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`} />
                <div className={`absolute -inset-[1px] bg-gradient-to-r ${stat.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative text-center p-8 bg-[#0a0a0f] rounded-2xl border border-white/[0.06] group-hover:border-transparent transition-all duration-500">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} p-[1px] mb-4`}>
                    <div className="w-full h-full rounded-xl bg-[#0a0a0f] flex items-center justify-center group-hover:bg-transparent transition-colors duration-500">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${stat.gradient} mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ClientsTestimonials;
