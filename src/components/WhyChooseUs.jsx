import { Award, Smile, Shield, Zap, GitBranch, TrendingUp } from 'lucide-react';

const WhyChooseUs = () => {
    const advantages = [
        { icon: Award, title: 'Proven Track Record', desc: 'Secure, scalable solutions.' },
        { icon: Zap, title: 'Comprehensive Expertise', desc: 'Telecom, cloud, & security.' },
        { icon: Smile, title: 'Customer Satisfaction', desc: 'Long-term partnerships.' },
        { icon: TrendingUp, title: 'Innovation-Driven', desc: 'Modern service delivery.' },
        { icon: Shield, title: 'Security First', desc: 'Robust protection frameworks.' },
        { icon: GitBranch, title: 'Digital Transformation', desc: 'Supporting your journey.' },
    ];

    return (
        <section className="py-32 px-6 bg-[#030305] relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left Content */}
                    <div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                            Why Choose <span className="text-cyan-400">PHILOCOM</span>?
                        </h2>
                        <p className="text-gray-400 text-lg mb-12 max-w-lg">
                            We combine technical expertise with a deep understanding of business needs to deliver solutions that truly matter.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-10">
                            {advantages.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <div key={index} className="flex gap-4 group">
                                        <div className="shrink-0 w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                                            <Icon className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold mb-1 group-hover:text-cyan-400 transition-colors">{item.title}</h4>
                                            <p className="text-sm text-gray-500">{item.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Visual */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur-2xl opacity-20 transform rotate-3"></div>
                        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a0a]">
                            <img
                                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80"
                                alt="Workspace"
                                className="w-full h-full object-cover opacity-60 hover:opacity-80 transition-opacity duration-500"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent">
                                <p className="text-2xl font-bold text-white italic">"Quality is our priority"</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
