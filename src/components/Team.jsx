import { useEffect, useRef } from 'react';
import { Linkedin, Mail, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Team = () => {
  const sectionRef = useRef();

  const teamMembers = [
    {
      name: 'Abebe Tadesse',
      role: 'CEO & Co-Founder',
      bio: '15+ years in enterprise technology. Leading digital transformation across East Africa.',
      linkedin: '#',
      email: 'abebe@philocom.co',
      expertise: ['Cloud Architecture', 'Digital Transformation', 'Leadership']
    },
    {
      name: 'Hana Bekele',
      role: 'CTO & Co-Founder',
      bio: 'Cybersecurity expert with 12+ years protecting critical infrastructure.',
      linkedin: '#',
      email: 'hana@philocom.co',
      expertise: ['Cybersecurity', 'System Architecture', 'DevSecOps']
    },
    {
      name: 'Dawit Mengistu',
      role: 'Head of IoT Solutions',
      bio: 'Pioneer in IoT with 100+ successful smart device deployments across Africa.',
      linkedin: '#',
      email: 'dawit@philocom.co',
      expertise: ['IoT Development', 'Edge Computing', 'Sensor Networks']
    },
    {
      name: 'Meron Hailu',
      role: 'VP of Engineering',
      bio: 'Full-stack architect specializing in scalable cloud-native applications.',
      linkedin: '#',
      email: 'meron@philocom.co',
      expertise: ['Software Architecture', 'Microservices', 'Team Leadership']
    },
  ];

  useEffect(() => {
    gsap.fromTo(
      '.team-card',
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
      }
    );
  }, []);

  return (
    <section
      id="team"
      ref={sectionRef}
      className="py-32 px-6 bg-white relative overflow-hidden"
    >
      {/* Subtle Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-1 bg-gray-900" />
            <span className="text-sm font-semibold text-gray-600 tracking-widest uppercase">
              Our Team
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4">
            Leadership Team
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl">
            Passionate technologists and innovators transforming vision into reality
          </p>
        </div>

        {/* Team Grid - No Photos */}
        <div className="grid md:grid-cols-2 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="team-card group"
            >
              <div className="p-8 bg-gray-50 rounded-2xl border border-gray-200 hover:border-gray-900 hover:bg-white transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                {/* Header with Name & Role */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-gray-600 font-medium">
                    {member.role}
                  </p>
                </div>

                {/* Bio */}
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {member.bio}
                </p>

                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {member.expertise.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Contact Links */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <a
                    href={member.linkedin}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:border-gray-900 transition-all"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Join Team CTA */}
        <div className="mt-20">
          <div className="p-12 bg-gray-900 rounded-3xl text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              Join Our Team
            </h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              We're always looking for talented individuals passionate about technology and innovation to help us build the future.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-all"
            >
              View Open Positions
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
