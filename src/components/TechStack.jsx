import { useEffect, useRef } from 'react';
import { Cpu, Database, Cloud, Lock, Code, Zap } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TechStack = () => {
  const sectionRef = useRef();

  const techCategories = [
    {
      category: 'Frontend',
      icon: Code,
      technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS']
    },
    {
      category: 'Backend',
      icon: Database,
      technologies: ['Node.js', 'Python', 'PostgreSQL', 'MongoDB']
    },
    {
      category: 'Cloud & DevOps',
      icon: Cloud,
      technologies: ['AWS', 'Docker', 'Kubernetes', 'Terraform']
    },
    {
      category: 'IoT & Edge',
      icon: Cpu,
      technologies: ['MQTT', 'Edge Computing', 'Sensor Networks', 'Real-time Analytics']
    },
    {
      category: 'Security',
      icon: Lock,
      technologies: ['Penetration Testing', 'Encryption', 'Zero Trust', 'SIEM']
    },
    {
      category: 'AI & ML',
      icon: Zap,
      technologies: ['TensorFlow', 'PyTorch', 'NLP', 'Computer Vision']
    },
  ];

  useEffect(() => {
    gsap.fromTo(
      '.tech-category',
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
      ref={sectionRef}
      className="py-32 px-6 bg-black relative overflow-hidden"
    >
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #fff 1px, transparent 1px),
            linear-gradient(to bottom, #fff 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-1 bg-white" />
            <span className="text-sm font-semibold text-gray-500 tracking-widest uppercase">
              Technology Stack
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
            Tools We Master
          </h2>

          <p className="text-xl text-gray-400 max-w-2xl">
            Industry-leading technologies powering enterprise solutions
          </p>
        </div>

        {/* Tech Grid - Clean Design */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {techCategories.map((category, index) => {
            const Icon = category.icon;

            return (
              <div
                key={index}
                className="tech-category group"
              >
                <div className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-500 hover:-translate-y-1">
                  {/* Icon & Title */}
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                    <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{category.category}</h3>
                  </div>

                  {/* Technologies List */}
                  <div className="space-y-3">
                    {category.technologies.map((tech, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                      >
                        <div className="w-1 h-1 bg-gray-600 rounded-full" />
                        <span className="text-sm font-medium">{tech}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tech Partners */}
        <div className="mt-24 pt-12 border-t border-white/10">
          <p className="text-center text-gray-600 text-sm mb-12 uppercase tracking-wider font-semibold">
            Certified Partners
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {['AWS', 'Google Cloud', 'Microsoft Azure', 'Docker', 'Kubernetes', 'Terraform'].map((tech, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center p-6 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all group"
              >
                <span className="text-lg font-bold text-gray-600 group-hover:text-white transition-colors">
                  {tech}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStack;
