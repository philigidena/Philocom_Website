import { Cloud, Phone, Shield, Server, ArrowRight, Activity } from 'lucide-react';

const Services = () => {
    const services = [
        {
            icon: Cloud,
            title: 'IT & Cloud Infrastructure',
            description: 'Seamless integration and optimal performance for your IT environment.',
            features: ['Cloud Computing', 'System Design', 'Disaster Recovery'],
            image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
        },
        {
            icon: Phone,
            title: 'Communication',
            description: 'Scalable VoIP systems empowering team collaboration.',
            features: ['VoIP Solutions', 'Unified Comm', 'SMS Services'],
            image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
        },
        {
            icon: Shield,
            title: 'Cybersecurity',
            description: 'Actionable insights to protect against cyber threats.',
            features: ['Security Audits', 'Compliance', 'IT Support'],
            image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
        },
        {
            icon: Server,
            title: 'Hardware Supply',
            description: 'Premium network hardware for modern environments.',
            features: ['Network Gear', 'Security Components', 'Accessories'],
            image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
        },
    ];

    return (
        <section className="py-32 px-6 bg-[#050505] relative">
            <div className="max-w-7xl mx-auto">

                <div className="flex flex-col md:flex-row justify-between items-end mb-20">
                    <div>
                        <div className="flex items-center gap-2 text-cyan-400 mb-4">
                            <Activity className="w-5 h-5" />
                            <span className="text-sm font-medium tracking-widest uppercase">Our Expertise</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">Comprehensive <br />Solutions</h2>
                    </div>
                    <p className="text-gray-400 max-w-md text-lg mt-6 md:mt-0">
                        Tailored technology services designed to elevate your business operations and drive growth.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <div key={index} className="group relative h-[420px] rounded-3xl overflow-hidden bg-[#0a0a0a] border border-white/5 hover:border-cyan-500/30 transition-all duration-500">

                                {/* Image Background with Overlay */}
                                <div className="absolute inset-0">
                                    <img src={service.image} alt={service.title} className="w-full h-full object-cover opacity-40 group-hover:opacity-20 transition-opacity duration-500 scale-100 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent"></div>
                                </div>

                                {/* Content */}
                                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6 backdrop-blur-md border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors">
                                        <Icon className="w-6 h-6 text-cyan-400" />
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">{service.title}</h3>
                                    <p className="text-gray-400 text-sm mb-6 line-clamp-2">{service.description}</p>

                                    {/* Features List (Visible on Hover) */}
                                    <div className="space-y-2 h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                                        {service.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                                                <div className="w-1 h-1 rounded-full bg-cyan-400"></div>
                                                {feature}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                                        <span className="text-xs font-medium text-white uppercase tracking-wider">Explore</span>
                                        <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-2 transition-transform" />
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

export default Services;
