import { Lightbulb, Shield, Users, Lock, Heart } from 'lucide-react';

const CoreValues = () => {
    const values = [
        { icon: Lightbulb, title: 'Innovation', desc: 'Pursuing modern technologies.' },
        { icon: Shield, title: 'Reliability', desc: 'Consistent, dependable solutions.' },
        { icon: Users, title: 'Diversity', desc: 'Embracing strengths of all.' },
        { icon: Lock, title: 'Integrity', desc: 'Honesty and accountability.' },
        { icon: Heart, title: 'Customer', desc: 'Prioritizing partnerships.' },
    ];

    return (
        <section className="py-24 px-6 bg-[#050505] border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Core Values</h2>
                    <p className="text-gray-400">The principles that guide our every action.</p>
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                    {values.map((value, index) => {
                        const Icon = value.icon;
                        return (
                            <div key={index} className="group flex-1 min-w-[200px] max-w-[240px] p-6 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:border-cyan-500/30 transition-all hover:-translate-y-1 text-center">
                                <div className="w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 transition-colors">
                                    <Icon className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                                </div>
                                <h3 className="text-white font-bold mb-2">{value.title}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">{value.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default CoreValues;
