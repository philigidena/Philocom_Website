import { useEffect, useRef } from 'react';
import { Target, Eye, Zap } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Mission = () => {
    const sectionRef = useRef();

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Connecting Line Animation
            gsap.fromTo('.connector-line',
                { scaleX: 0, opacity: 0 },
                {
                    scaleX: 1, opacity: 1, duration: 1.5, ease: 'power3.out', scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 70%',
                    }
                }
            );

            // Pulse Animation
            gsap.to('.pulse-node', {
                scale: 1.5,
                opacity: 0,
                duration: 2,
                repeat: -1,
                ease: 'power1.out',
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="relative py-32 px-6 bg-[#030305] overflow-hidden">

            {/* Background Circuit Effect */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                <div className="absolute top-0 left-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent"></div>
            </div>

            {/* Grid Overlay (Consistent) */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-stretch">

                    {/* Mission Card */}
                    <div className="group relative p-10 rounded-[2.5rem] bg-gradient-to-b from-[#0f172a] to-[#020617] border border-white/5 hover:border-cyan-500/30 transition-all duration-500">
                        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                            <Target className="w-24 h-24 text-cyan-500 rotate-12" />
                        </div>

                        <div className="relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-8 border border-cyan-500/20 group-hover:scale-110 transition-transform duration-500">
                                <Target className="w-8 h-8 text-cyan-400" />
                            </div>

                            <h3 className="text-3xl font-bold text-white mb-6">Our Mission</h3>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                To deliver seamless communication experiences and drive technological innovation. We contribute to global digital transformation by providing dependable, efficient, and high-performance telecommunications and IT solutions that empower businesses to thrive.
                            </p>
                        </div>
                    </div>

                    {/* Vision Card */}
                    <div className="group relative p-10 rounded-[2.5rem] bg-gradient-to-b from-[#0f172a] to-[#020617] border border-white/5 hover:border-blue-500/30 transition-all duration-500">
                        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                            <Eye className="w-24 h-24 text-blue-500 rotate-12" />
                        </div>

                        <div className="relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                                <Eye className="w-8 h-8 text-blue-400" />
                            </div>

                            <h3 className="text-3xl font-bold text-white mb-6">Our Vision</h3>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                To revolutionize communication infrastructure and set new industry standards of excellence. We envision a more connected, secure, and inclusive global society where technology bridges gaps and creates opportunities for everyone.
                            </p>
                        </div>
                    </div>

                </div>

                {/* Central Connector Animation (Visualizing 'Connection') */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center">
                    <div className="relative w-20 h-20 rounded-full bg-[#030305] border border-white/10 flex items-center justify-center z-20">
                        <Zap className="w-8 h-8 text-white animate-pulse" />
                        <div className="pulse-node absolute inset-0 rounded-full border border-cyan-500/30"></div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Mission;
