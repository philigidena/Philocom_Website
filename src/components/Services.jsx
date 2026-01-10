import { useState, useEffect, useRef } from 'react';
import { Cloud, Phone, Shield, Server, ArrowRight, Activity, Settings, Building2, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Services = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const sectionRef = useRef();
  const headerRef = useRef();

  const services = [
    {
      icon: Shield,
      title: 'Consulting & Cybersecurity',
      description: 'Optimize IT strategy and protect against cyber threats with actionable insights.',
      features: ['Security Audits', 'Compliance', 'Risk Assessment', 'Threat Detection'],
      gradient: 'from-cyan-400 to-cyan-600',
    },
    {
      icon: Phone,
      title: 'VoIP, A2P & Communication',
      description: 'Scalable solutions for seamless communication across all channels.',
      features: ['VoIP Solutions', 'A2P Messaging', 'Unified Communications', 'SIP Trunking'],
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      icon: Cloud,
      title: 'Cloud Computing',
      description: 'Seamless integration and optimal performance for your IT environment.',
      features: ['AWS/Azure/GCP', 'Cloud Migration', 'Infrastructure Design', 'Cost Optimization'],
      gradient: 'from-blue-500 to-blue-700',
    },
    {
      icon: Activity,
      title: 'IT Support & Helpdesk',
      description: 'Proactive monitoring and troubleshooting to minimize downtime.',
      features: ['24/7 Support', 'Remote Assistance', 'System Monitoring', 'Technical Support'],
      gradient: 'from-blue-600 to-cyan-500',
    },
    {
      icon: Server,
      title: 'System Design & Development',
      description: 'Custom systems from concept to implementation, aligned with your goals.',
      features: ['Architecture Design', 'Custom Development', 'API Integration', 'Scalable Solutions'],
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      icon: Shield,
      title: 'Backup & Disaster Recovery',
      description: 'Safeguard data and ensure business continuity with robust backup solutions.',
      features: ['Data Backup', 'Disaster Recovery', 'Business Continuity', 'Ransomware Protection'],
      gradient: 'from-blue-400 to-cyan-500',
    },
    {
      icon: Settings,
      title: 'Product Supply',
      description: 'Network hardware, security systems, and computer accessories.',
      features: ['Network Equipment', 'Security Components', 'Accessories', 'Premium Hardware'],
      gradient: 'from-cyan-600 to-blue-600',
    },
    {
      icon: Building2,
      title: 'ERP & CRM',
      description: 'Streamline operations and enhance customer relationships with integrated solutions.',
      features: ['ERP Implementation', 'CRM Systems', 'Business Intelligence', 'Process Automation'],
      gradient: 'from-blue-500 to-cyan-400',
    },
    {
      icon: Sparkles,
      title: 'AI Automation & AI Agents',
      description: 'Intelligent automation and AI-powered agents to optimize workflows and boost productivity.',
      features: ['Process Automation', 'AI Chatbots', 'Machine Learning', 'Predictive Analytics'],
      gradient: 'from-cyan-400 to-blue-500',
    },
  ];

  const itemsPerPage = 3;
  const totalPages = Math.ceil(services.length / itemsPerPage);

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo('.services-eyebrow',
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 80%',
          }
        }
      );

      gsap.fromTo('.services-title',
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

      gsap.fromTo('.services-subtitle',
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

      // Cards animation
      gsap.fromTo('.service-card',
        { opacity: 0, y: 80, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.services-carousel',
            start: 'top 75%',
          }
        }
      );

      // Parallax effect for background elements
      gsap.to('.services-bg-orb', {
        y: -100,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalPages);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, totalPages]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalPages);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalPages) % totalPages);
    setIsAutoPlaying(false);
  };

  const handleDotClick = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <section
      id="services"
      ref={sectionRef}
      className="py-32 px-6 bg-[#030305] relative overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="services-bg-orb absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px]" />
      <div className="services-bg-orb absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div ref={headerRef} className="mb-20">
          <div className="services-eyebrow flex items-center gap-4 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-cyan-400 to-transparent" />
            <span className="text-sm font-semibold text-cyan-400 tracking-widest uppercase">Our Expertise</span>
          </div>
          <h2 className="services-title text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 tracking-tight">
            Comprehensive{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
              Solutions
            </span>
          </h2>
          <p className="services-subtitle text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed">
            Tailored technology services designed to elevate your business operations
            and drive sustainable growth.
          </p>
        </div>

        {/* Carousel */}
        <div className="services-carousel relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({ length: totalPages }).map((_, pageIndex) => (
                <div key={pageIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-1">
                    {services
                      .slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage)
                      .map((service, index) => {
                        const Icon = service.icon;
                        const cardIndex = pageIndex * itemsPerPage + index;
                        return (
                          <div
                            key={index}
                            className="service-card group relative"
                            onMouseEnter={() => setHoveredCard(cardIndex)}
                            onMouseLeave={() => setHoveredCard(null)}
                          >
                            {/* Gradient border effect */}
                            <div className={`absolute -inset-[1px] bg-gradient-to-r ${service.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`} />
                            <div className={`absolute -inset-[1px] bg-gradient-to-r ${service.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                            {/* Card content */}
                            <div className="relative p-8 bg-[#0a0a0f] rounded-2xl border border-white/[0.06] group-hover:border-transparent transition-all duration-500 h-full flex flex-col">
                              {/* Gradient accent on hover */}
                              <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 rounded-bl-[100px] transition-opacity duration-500`} />

                              {/* Animated line */}
                              <div className={`absolute left-0 top-0 w-1 h-0 bg-gradient-to-b ${service.gradient} group-hover:h-full transition-all duration-700 rounded-l-2xl`} />

                              <div className="relative z-10 flex-1 flex flex-col">
                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.gradient} p-[1px] mb-6`}>
                                  <div className="w-full h-full rounded-xl bg-[#0a0a0f] flex items-center justify-center group-hover:bg-transparent transition-colors duration-500">
                                    <Icon className="w-6 h-6 text-white" />
                                  </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                                  {service.title}
                                </h3>

                                {/* Description */}
                                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                  {service.description}
                                </p>

                                {/* Features */}
                                <div className="space-y-2 mb-6 flex-1">
                                  {service.features.map((feature, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-3 text-sm text-gray-500 group-hover:text-gray-400 transition-colors duration-300"
                                      style={{ transitionDelay: `${idx * 50}ms` }}
                                    >
                                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${service.gradient}`} />
                                      {feature}
                                    </div>
                                  ))}
                                </div>

                                {/* CTA */}
                                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between group-hover:border-white/10 transition-colors duration-300">
                                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider group-hover:text-white transition-colors duration-300">
                                    Learn More
                                  </span>
                                  <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gradient-to-r ${service.gradient} transition-all duration-300`}>
                                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white/5 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 z-10 group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white/5 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 z-10 group"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-3 mt-12">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  currentSlide === index
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 w-10'
                    : 'bg-white/20 hover:bg-white/30 w-2'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Service Counter */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              <span className="text-cyan-400 font-semibold">{currentSlide * itemsPerPage + 1}-{Math.min((currentSlide + 1) * itemsPerPage, services.length)}</span>
              <span className="mx-2">/</span>
              <span>{services.length} services</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
