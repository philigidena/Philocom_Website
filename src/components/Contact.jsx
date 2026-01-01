import { useEffect, useRef } from 'react';
import { MapPin, Mail, Phone, Globe, Send } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
    const sectionRef = useRef();
    const cardsRef = useRef([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Staggered entrance for cards
            // Staggered entrance for cards
            gsap.fromTo('.contact-card',
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 85%', // Trigger earlier
                    },
                }
            );

            // CTA reveal
            gsap.from('.cta-box', {
                scale: 0.9,
                opacity: 0,
                duration: 1,
                ease: 'back.out(1.2)',
                scrollTrigger: {
                    trigger: '.cta-box',
                    start: 'top 80%',
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const contactInfo = [
        {
            icon: MapPin,
            title: 'Office Location',
            details: ['Nile Source Building, 5th Floor', 'Africa AV / Bole Road', 'Addis Ababa, Ethiopia'],
            gradient: 'from-cyan-400 to-blue-600',
        },
        {
            icon: Mail,
            title: 'Email',
            details: ['info@philocom.co'],
            gradient: 'from-blue-500 to-purple-600',
        },
        {
            icon: Phone,
            title: 'Phone',
            details: ['+251 947 447 244'],
            gradient: 'from-purple-500 to-pink-600',
        },
        {
            icon: Globe,
            title: 'Website',
            details: ['www.philocom.co'],
            gradient: 'from-pink-500 to-red-600',
        },
    ];

    return (
        <section ref={sectionRef} className="relative py-20 px-4 bg-[#030305] overflow-hidden">
            {/* Grid Overlay (Consistent) */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-block mb-4">
                        <span className="text-cyan-400 font-semibold text-sm uppercase tracking-wider">
                            GET IN TOUCH
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                        Contact Information
                    </h2>
                    <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                        Ready to transform your business? Reach out to us and let's start your digital journey
                    </p>
                    <div className="w-20 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto mt-6"></div>
                </div>

                {/* Contact Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {contactInfo.map((info, index) => {
                        const Icon = info.icon;
                        return (
                            <div
                                key={index}
                                className="contact-card group p-6 rounded-2xl bg-[#0f1115] border border-white/10 hover:border-cyan-500/50 hover:scale-105 transition-all duration-500 text-center relative overflow-hidden shadow-lg"
                            >
                                {/* Data Stream Animation Background */}
                                <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                                    <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-500 to-transparent animate-[data-stream_3s_infinite_linear]" style={{ animationDelay: '0s' }}></div>
                                    <div className="absolute top-0 left-3/4 w-[1px] h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent animate-[data-stream_4s_infinite_linear]" style={{ animationDelay: '1s' }}></div>
                                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-[data-stream_5s_infinite_linear]" style={{ animationDelay: '0.5s' }}></div>
                                </div>

                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className={`absolute inset-0 bg-gradient-to-br ${info.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${info.gradient} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                                    <Icon className="w-7 h-7 text-white" />
                                </div>
                                <h4 className="text-white font-semibold mb-3 relative z-10">{info.title}</h4>
                                <div className="space-y-1 relative z-10">
                                    {info.details.map((detail, idx) => (
                                        <p key={idx} className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                                            {detail}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* CTA Card */}
                <div className="cta-box relative">
                    <div className="rounded-3xl p-12 text-center relative overflow-hidden bg-[#0a0a0a] border border-white/10">
                        {/* Background Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-600/10 to-purple-600/10 opacity-50"></div>

                        <div className="relative z-10">
                            <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                                Ready to Get Started?
                            </h3>
                            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                                Let's discuss how PHILOCOM can help your organization achieve its digital transformation goals
                            </p>

                            <a
                                href="mailto:info@philocom.co"
                                className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-semibold text-lg hover:shadow-2xl hover:shadow-cyan-400/50 hover:scale-105 transition-all duration-300"
                            >
                                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                Contact Us Today
                            </a>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-600/10 to-transparent rounded-full blur-3xl"></div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-gray-800">
                    <div className="text-center text-gray-500">
                        <p className="mb-2">© 2025 PHILOCOM Technology. All rights reserved.</p>
                        <p className="text-sm">Pioneering the future of communication and technology since 2017</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
