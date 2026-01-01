import { useState, useEffect } from 'react';
import { Cloud, Phone, Shield, Server, ArrowRight, Activity, Settings, Building2, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const Services = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const services = [
        {
            icon: Shield,
            title: 'Consulting & Cybersecurity',
            description: 'Optimize IT strategy and protect against cyber threats with actionable insights.',
            features: ['Security Audits', 'Compliance', 'Risk Assessment', 'Threat Detection'],
        },
        {
            icon: Phone,
            title: 'VoIP, A2P & Communication',
            description: 'Scalable solutions for seamless communication across all channels.',
            features: ['VoIP Solutions', 'A2P Messaging', 'Unified Communications', 'SIP Trunking'],
        },
        {
            icon: Cloud,
            title: 'Cloud Computing',
            description: 'Seamless integration and optimal performance for your IT environment.',
            features: ['AWS/Azure/GCP', 'Cloud Migration', 'Infrastructure Design', 'Cost Optimization'],
        },
        {
            icon: Activity,
            title: 'IT Support & Helpdesk',
            description: 'Proactive monitoring and troubleshooting to minimize downtime.',
            features: ['24/7 Support', 'Remote Assistance', 'System Monitoring', 'Technical Support'],
        },
        {
            icon: Server,
            title: 'System Design & Development',
            description: 'Custom systems from concept to implementation, aligned with your goals.',
            features: ['Architecture Design', 'Custom Development', 'API Integration', 'Scalable Solutions'],
        },
        {
            icon: Shield,
            title: 'Backup & Disaster Recovery',
            description: 'Safeguard data and ensure business continuity with robust backup solutions.',
            features: ['Data Backup', 'Disaster Recovery', 'Business Continuity', 'Ransomware Protection'],
        },
        {
            icon: Settings,
            title: 'Product Supply',
            description: 'Network hardware, security systems, and computer accessories.',
            features: ['Network Equipment', 'Security Components', 'Accessories', 'Premium Hardware'],
        },
        {
            icon: Building2,
            title: 'ERP & CRM',
            description: 'Streamline operations and enhance customer relationships with integrated solutions.',
            features: ['ERP Implementation', 'CRM Systems', 'Business Intelligence', 'Process Automation'],
        },
        {
            icon: Sparkles,
            title: 'AI Automation & AI Agents',
            description: 'Intelligent automation and AI-powered agents to optimize workflows and boost productivity.',
            features: ['Process Automation', 'AI Chatbots', 'Machine Learning', 'Predictive Analytics'],
        },
    ];

    const itemsPerPage = 3;
    const totalPages = Math.ceil(services.length / itemsPerPage);

    // Auto-scroll functionality
    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % totalPages);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [isAutoPlaying, totalPages]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalPages);
        setIsAutoPlaying(false); // Pause auto-play when user manually navigates
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalPages) % totalPages);
        setIsAutoPlaying(false); // Pause auto-play when user manually navigates
    };

    const handleDotClick = (index) => {
        setCurrentSlide(index);
        setIsAutoPlaying(false); // Pause auto-play when user manually navigates
    };

    return (
        <section className="py-32 px-6 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto">

                <div className="mb-20">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-1 bg-gray-900" />
                        <span className="text-sm font-semibold text-gray-600 tracking-widest uppercase">Our Expertise</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4">
                        Comprehensive Solutions
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl">
                        Tailored technology services designed to elevate your business operations
                    </p>
                </div>

                {/* Horizontal Carousel */}
                <div className="relative">
                    <div className="overflow-hidden">
                        <div
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        >
                            {Array.from({ length: totalPages }).map((_, pageIndex) => (
                                <div key={pageIndex} className="w-full flex-shrink-0">
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
                                        {services
                                            .slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage)
                                            .map((service, index) => {
                                                const Icon = service.icon;
                                                return (
                                                    <div key={index} className="group relative p-8 bg-gray-50 rounded-2xl border border-gray-200 hover:border-gray-900 hover:bg-white transition-all duration-500 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
                                                        {/* Dotted Pattern Background */}
                                                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                                                            <div
                                                                className="absolute inset-0"
                                                                style={{
                                                                    backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                                                                    backgroundSize: '20px 20px',
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Gradient Accent Corner */}
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-900/5 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                                        {/* Vertical Accent Line */}
                                                        <div className="absolute left-0 top-0 w-1 h-0 bg-gradient-to-b from-gray-900 to-gray-400 group-hover:h-full transition-all duration-500"></div>

                                                        <div className="relative z-10">
                                                            <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center mb-6 group-hover:bg-gray-900 transition-colors relative overflow-hidden">
                                                                {/* Icon Background Pattern */}
                                                                <div className="absolute inset-0 opacity-10">
                                                                    <div
                                                                        className="absolute inset-0"
                                                                        style={{
                                                                            backgroundImage: 'linear-gradient(45deg, transparent 48%, currentColor 48%, currentColor 52%, transparent 52%)',
                                                                            backgroundSize: '10px 10px',
                                                                        }}
                                                                    />
                                                                </div>
                                                                <Icon className="w-6 h-6 text-gray-900 group-hover:text-white transition-colors relative z-10" />
                                                            </div>

                                                            <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                                                            <p className="text-gray-600 text-sm mb-6">{service.description}</p>

                                                            {/* Features List */}
                                                            <div className="space-y-2 mb-6">
                                                                {service.features.map((feature, idx) => (
                                                                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                                                                        <div className="w-1 h-1 rounded-full bg-gray-900"></div>
                                                                        {feature}
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                                                                <span className="text-xs font-medium text-gray-900 uppercase tracking-wider">Learn More</span>
                                                                <ArrowRight className="w-4 h-4 text-gray-900 group-hover:translate-x-2 transition-transform" />
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
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors shadow-lg z-10"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                        onClick={nextSlide}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors shadow-lg z-10"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Dots Navigation */}
                    <div className="flex justify-center gap-2 mt-8">
                        {Array.from({ length: totalPages }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handleDotClick(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    currentSlide === index ? 'bg-gray-900 w-8' : 'bg-gray-300'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Service Counter */}
                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-500">
                            Showing {currentSlide * itemsPerPage + 1}-{Math.min((currentSlide + 1) * itemsPerPage, services.length)} of {services.length} services
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Services;
