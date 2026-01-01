import { useEffect, useRef, useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ClientsTestimonials = () => {
  const sectionRef = useRef();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const clients = [
    { name: 'TechCorp', logo: 'https://via.placeholder.com/150x60/667eea/ffffff?text=TechCorp' },
    { name: 'InnovateCo', logo: 'https://via.placeholder.com/150x60/764ba2/ffffff?text=InnovateCo' },
    { name: 'CloudSystems', logo: 'https://via.placeholder.com/150x60/f093fb/ffffff?text=CloudSystems' },
    { name: 'DataFlow', logo: 'https://via.placeholder.com/150x60/4facfe/ffffff?text=DataFlow' },
    { name: 'SecureNet', logo: 'https://via.placeholder.com/150x60/43e97b/ffffff?text=SecureNet' },
    { name: 'IoTech', logo: 'https://via.placeholder.com/150x60/fa709a/ffffff?text=IoTech' },
  ];

  const testimonials = [
    {
      name: 'Michael Rodriguez',
      role: 'CTO, TechCorp',
      company: 'TechCorp',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
      rating: 5,
      text: 'Philocom transformed our infrastructure completely. The cloud migration was seamless, and our operational costs dropped by 40% while performance improved dramatically. Their team is exceptionally professional.',
      project: 'Cloud Infrastructure Modernization'
    },
    {
      name: 'Jennifer Liu',
      role: 'VP of Engineering, InnovateCo',
      company: 'InnovateCo',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80',
      rating: 5,
      text: 'The IoT solution they built handles 50,000 devices effortlessly. Real-time monitoring and predictive maintenance have revolutionized our operations. Couldn\'t ask for a better partner.',
      project: 'Enterprise IoT Platform'
    },
    {
      name: 'David Thompson',
      role: 'CEO, SecureNet',
      company: 'SecureNet',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80',
      rating: 5,
      text: 'Their cybersecurity expertise is unmatched. They identified and patched vulnerabilities we didn\'t even know existed. Our security posture has never been stronger. Highly recommended!',
      project: 'Security Audit & Hardening'
    },
    {
      name: 'Sarah Chen',
      role: 'Director of IT, CloudSystems',
      company: 'CloudSystems',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
      rating: 5,
      text: 'From day one, Philocom showed deep understanding of our needs. The custom solution they developed exceeded our expectations. Response time and technical support are outstanding.',
      project: 'Custom SaaS Platform Development'
    },
  ];

  useEffect(() => {
    gsap.fromTo(
      '.client-logo',
      {
        opacity: 0,
        scale: 0.8,
      },
      {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
      }
    );
  }, []);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[activeTestimonial];

  return (
    <section
      ref={sectionRef}
      className="py-32 px-6 bg-gradient-to-b from-[#0a0a0a] to-[#030305] relative overflow-hidden"
    >
      {/* Background Decorations */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 mb-6">
            <Award className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-medium text-pink-400 tracking-wider uppercase">
              Client Success
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Industry Leaders</span>
          </h2>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Join hundreds of satisfied clients who have transformed their businesses with our solutions.
          </p>
        </div>

        {/* Client Logos */}
        <div className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {clients.map((client, index) => (
              <div
                key={index}
                className="client-logo group"
              >
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-cyan-500/30 hover:bg-white/10 transition-all duration-300 flex items-center justify-center h-24">
                  <img
                    src={client.logo}
                    alt={client.name}
                    className="max-w-full max-h-full opacity-60 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Carousel */}
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Main Testimonial Card */}
            <div className="bg-gradient-to-br from-[#0f0f0f] to-[#0a0a0a] rounded-3xl p-12 border border-white/10 shadow-2xl">
              {/* Quote Icon */}
              <div className="absolute top-8 right-8 opacity-10">
                <Quote className="w-24 h-24 text-cyan-400" />
              </div>

              <div className="relative z-10">
                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-2xl text-gray-300 leading-relaxed mb-8 font-light">
                  "{currentTestimonial.text}"
                </p>

                {/* Project Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-8">
                  <span className="text-sm text-cyan-400 font-medium">Project: {currentTestimonial.project}</span>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={currentTestimonial.image}
                    alt={currentTestimonial.name}
                    className="w-16 h-16 rounded-full border-2 border-cyan-500/50 object-cover"
                  />
                  <div>
                    <h4 className="text-xl font-bold text-white">{currentTestimonial.name}</h4>
                    <p className="text-cyan-400 text-sm">{currentTestimonial.role}</p>
                    <p className="text-gray-500 text-sm">{currentTestimonial.company}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-300 hover:scale-110"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              {/* Dots Indicator */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === activeTestimonial
                        ? 'bg-cyan-400 w-8'
                        : 'bg-white/20 hover:bg-white/40'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  ></button>
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-300 hover:scale-110"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <div className="text-center p-6">
            <div className="text-4xl font-bold text-cyan-400 mb-2">98%</div>
            <div className="text-gray-400">Client Satisfaction</div>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl font-bold text-cyan-400 mb-2">200+</div>
            <div className="text-gray-400">Happy Clients</div>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl font-bold text-cyan-400 mb-2">500+</div>
            <div className="text-gray-400">Projects Delivered</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientsTestimonials;
