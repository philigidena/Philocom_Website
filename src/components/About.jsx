import { useEffect, useRef } from 'react';
import { Calendar, Target, Lightbulb, Settings, ArrowRight } from 'lucide-react';
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
            streams.forEach((stream, i) => {
                gsap.to(stream, {
                    y: '100%',
                    duration: 2 + Math.random() * 2,
                    repeat: -1,
                    ease: 'none',
                    delay: Math.random() * 2,
                });
            });

            // Content Reveal
            // Content Reveal
            gsap.fromTo('.reveal-text',
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    stagger: 0.1,
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top 85%', // Trigger earlier
                    },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const highlights = [
        { icon: Calendar, label: 'Founded', value: '2017', desc: 'Years of innovation' },
        { icon: Target, label: 'Focus', value: 'Global', desc: 'Digital Transformation' },
        { icon: Lightbulb, label: 'Expertise', value: 'IoT', desc: 'Cloud & Security' },
        { icon: Settings, label: 'Solutions', value: 'Tech', desc: 'Strategic Advisory' },
    ];

    return (
        <section ref={sectionRef} className="relative py-32 px-6 bg-[#050505] overflow-hidden">
            {/* Grid Overlay for Texture (Consistent with Hero) */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

            {/* Background Data Streams */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                {[...Array(10)].map((_, i) => (
                    <div
                        key={i}
                        className="data-stream absolute w-[1px] h-[200px] bg-gradient-to-b from-transparent via-cyan-500 to-transparent"
                        style={{
                            left: `${10 + i * 10}%`,
                            top: '-200px',
                            opacity: 0.3 + Math.random() * 0.5,
                        }}
                    />
                ))}
            </div>

            <div ref={containerRef} className="max-w-7xl mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-20 items-center">

                    {/* Left: Typography & Story */}
                    <div className="space-y-10">
                        <div className="reveal-text inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-950/30 border border-cyan-500/20 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                            <span className="text-cyan-400 text-sm font-medium tracking-widest uppercase">Our Story</span>
                        </div>

                        <h2 className="reveal-text text-5xl md:text-6xl font-bold text-white leading-tight">
                            Architecting the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                                Digital Future
                            </span>
                        </h2>

                        <div className="reveal-text space-y-6 text-lg text-gray-400 leading-relaxed">
                            <p>
                                Founded in <span className="text-white font-semibold">2017</span>, PHILOCOM has evolved from a visionary startup into a powerhouse of technological innovation. We don't just adapt to change; we drive it.
                            </p>
                            <p>
                                By integrating cutting-edge <span className="text-cyan-400">IoT ecosystems</span>, robust <span className="text-blue-400">cybersecurity frameworks</span>, and scalable cloud solutions, we empower organizations to navigate the complexities of the modern digital landscape with absolute confidence.
                            </p>
                        </div>

                        <div className="reveal-text pt-4">
                            <button className="group flex items-center gap-3 text-white font-semibold hover:text-cyan-400 transition-colors">
                                Read full story <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Right: Modern Grid Layout - Enhanced Visibility */}
                    <div className="grid grid-cols-2 gap-6">
                        {highlights.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={index}
                                    className="reveal-text group p-8 rounded-3xl bg-[#0f1115] border border-white/10 hover:border-cyan-500/50 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden shadow-2xl shadow-black/50"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors duration-500 border border-white/5 group-hover:border-cyan-500/30">
                                            <Icon className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                                        </div>
                                        <div className="text-3xl font-bold text-white mb-2">{item.value}</div>
                                        <div className="text-sm text-cyan-400 font-medium uppercase tracking-wider mb-1">{item.label}</div>
                                        <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">{item.desc}</div>
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
