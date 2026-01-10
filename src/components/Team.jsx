import { useEffect, useRef } from 'react';
import { Linkedin, Mail, ArrowRight, Users, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Team = () => {
  const sectionRef = useRef();
  const headerRef = useRef();

  const teamMembers = [
    {
      name: 'Filmon Tsegazeab',
      role: 'CEO & Business Analyst',
      bio: 'Strategic leader driving business growth through data-driven insights and innovative solutions.',
      linkedin: 'https://linkedin.com/in/',
      email: 'filmon.t@philocom.co',
      expertise: ['Business Strategy', 'Data Analytics', 'Leadership'],
      gradient: 'from-cyan-400 to-cyan-600',
      initials: 'FT'
    },
    {
      name: 'Filmon Gidena',
      role: 'CTO & Co-Founder',
      bio: 'Technology visionary with expertise in building scalable enterprise solutions and leading technical teams.',
      linkedin: 'https://linkedin.com/in/',
      email: 'filmon.g@philocom.co',
      expertise: ['System Architecture', 'Cloud Solutions', 'Technical Leadership'],
      gradient: 'from-cyan-500 to-blue-600',
      initials: 'FG'
    },
    {
      name: 'Aberaham Yifter',
      role: 'DevOps Engineer',
      bio: 'Infrastructure specialist focused on automation, CI/CD pipelines, and cloud-native deployments.',
      linkedin: 'https://linkedin.com/in/',
      email: 'aberaham@philocom.co',
      expertise: ['DevOps', 'Cloud Infrastructure', 'Automation'],
      gradient: 'from-blue-500 to-blue-700',
      initials: 'AY'
    },
    {
      name: 'Mensur Hassan',
      role: 'Senior Network Engineer',
      bio: 'Expert in designing and implementing robust network architectures for enterprise clients.',
      linkedin: 'https://linkedin.com/in/',
      email: 'mensur@philocom.co',
      expertise: ['Network Architecture', 'Security', 'VoIP Systems'],
      gradient: 'from-blue-600 to-cyan-500',
      initials: 'MH'
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax for background orbs
      gsap.to('.team-bg-orb', {
        y: -60,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        }
      });

      // Header animations
      gsap.fromTo('.team-eyebrow',
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
          }
        }
      );

      gsap.fromTo('.team-title',
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

      gsap.fromTo('.team-subtitle',
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

      // Team cards staggered animation
      gsap.fromTo('.team-card',
        { opacity: 0, y: 80, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.team-grid',
            start: 'top 75%',
          },
        }
      );

      // CTA section animation
      gsap.fromTo('.team-cta',
        { opacity: 0, y: 60, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.team-cta',
            start: 'top 85%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="team"
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
      <div className="team-bg-orb absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px]" />
      <div className="team-bg-orb absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div ref={headerRef} className="mb-20">
          <div className="team-eyebrow flex items-center gap-4 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-cyan-400 to-transparent" />
            <span className="text-sm font-semibold text-cyan-400 tracking-widest uppercase">Our Team</span>
          </div>

          <h2 className="team-title text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 tracking-tight">
            Leadership{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
              Team
            </span>
          </h2>

          <p className="team-subtitle text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed">
            Passionate technologists and innovators transforming vision into reality
          </p>
        </div>

        {/* Team Grid */}
        <div className="team-grid grid md:grid-cols-2 gap-6">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="team-card group relative"
            >
              {/* Gradient border effect */}
              <div className={`absolute -inset-[1px] bg-gradient-to-r ${member.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`} />
              <div className={`absolute -inset-[1px] bg-gradient-to-r ${member.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Card content */}
              <div className="relative p-8 bg-[#0a0a0f] rounded-2xl border border-white/[0.06] group-hover:border-transparent transition-all duration-500">
                {/* Gradient accent on hover */}
                <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${member.gradient} opacity-0 group-hover:opacity-5 rounded-bl-[100px] transition-opacity duration-500`} />

                {/* Animated line */}
                <div className={`absolute left-0 top-0 w-1 h-0 bg-gradient-to-b ${member.gradient} group-hover:h-full transition-all duration-700 rounded-l-2xl`} />

                <div className="relative z-10 flex flex-col sm:flex-row gap-6">
                  {/* Avatar */}
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${member.gradient} p-[2px] flex-shrink-0`}>
                    <div className="w-full h-full rounded-2xl bg-[#0a0a0f] flex items-center justify-center group-hover:bg-transparent transition-colors duration-500">
                      <span className="text-xl sm:text-2xl font-bold text-white">{member.initials}</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    {/* Header with Name & Role */}
                    <div className="mb-4">
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                        {member.name}
                      </h3>
                      <p className={`text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r ${member.gradient}`}>
                        {member.role}
                      </p>
                    </div>

                    {/* Bio */}
                    <p className="text-gray-400 text-sm leading-relaxed mb-5">
                      {member.bio}
                    </p>

                    {/* Expertise Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {member.expertise.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-white/5 border border-white/10 text-gray-400 text-xs font-medium rounded-full group-hover:border-white/20 group-hover:text-gray-300 transition-all duration-300"
                          style={{ transitionDelay: `${idx * 50}ms` }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Contact Links */}
                    <div className="flex gap-3 pt-4 border-t border-white/[0.06] group-hover:border-white/10 transition-colors duration-300">
                      <a
                        href={member.linkedin}
                        className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${member.gradient} text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-105`}
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </a>
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-gray-300 text-sm font-medium rounded-lg hover:border-white/30 hover:bg-white/10 hover:text-white transition-all duration-300"
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Join Team CTA */}
        <div className="team-cta mt-20">
          <div className="relative group">
            {/* Gradient border effect */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
            <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative p-12 bg-[#0a0a0f] rounded-3xl text-center">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 rounded-3xl" />

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 mb-6">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Join Our{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                    Team
                  </span>
                </h3>
                <p className="text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                  We're always looking for talented individuals passionate about technology and innovation to help us build the future.
                </p>
                <a
                  href="/careers"
                  className="group/btn inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-full hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 hover:scale-105"
                >
                  <span>View Open Positions</span>
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:bg-white/30 transition-colors">
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
