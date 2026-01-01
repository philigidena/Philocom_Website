import { useState, useEffect, useRef } from 'react';
import { ExternalLink, Github, ArrowRight, Code, Zap } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Portfolio = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [projects, setProjects] = useState([]);
  const sectionRef = useRef();

  // Real Philocom projects
  const sampleProjects = [
    {
      id: '1',
      title: 'AfriTutors',
      category: 'web',
      description: 'Educational platform connecting African students with quality tutors across the continent.',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
      technologies: ['React', 'Node.js', 'MongoDB', 'WebRTC'],
      link: 'https://afritutors.com',
      github: '#',
      featured: true,
      stats: {
        students: '5K+',
        tutors: '500+',
        sessions: '10K+'
      }
    },
    {
      id: '2',
      title: 'AfriTutors Learning Platform',
      category: 'web',
      description: 'Advanced learning management system with interactive courses and real-time collaboration.',
      image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80',
      technologies: ['Next.js', 'PostgreSQL', 'AWS', 'Tailwind'],
      link: 'https://learn.afritutors.com',
      github: '#',
      featured: true,
      stats: {
        courses: '100+',
        completion: '85%',
        satisfaction: '4.8/5'
      }
    },
    {
      id: '3',
      title: 'ZG Business Group',
      category: 'web',
      description: 'Corporate website for business consulting and investment firm with modern design.',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
      technologies: ['React', 'Vite', 'Tailwind', 'GSAP'],
      link: 'https://zgbusinessgroup.com',
      github: '#',
      featured: true,
      stats: {
        traffic: '+200%',
        leads: '+150%',
        engagement: '3.5min'
      }
    },
    {
      id: '4',
      title: 'Enterprise Cloud Migration',
      category: 'cloud',
      description: 'Migrated legacy infrastructure to AWS cloud, reducing costs by 40% and improving performance.',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
      technologies: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
      link: '#',
      github: '#',
      featured: false,
      stats: {
        performance: '+250%',
        cost: '-40%',
        uptime: '99.9%'
      }
    },
    {
      id: '5',
      title: 'IoT Security Platform',
      category: 'iot',
      description: 'Built end-to-end IoT security solution monitoring 10,000+ devices in real-time.',
      image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800&q=80',
      technologies: ['IoT', 'Node.js', 'MongoDB', 'MQTT'],
      link: '#',
      github: '#',
      featured: false,
      stats: {
        devices: '10K+',
        latency: '<100ms',
        threats: '500+ blocked'
      }
    },
    {
      id: '6',
      title: 'VoIP Communication Suite',
      category: 'telecom',
      description: 'Scalable VoIP platform handling 50,000 concurrent calls with crystal-clear quality.',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
      technologies: ['WebRTC', 'Node.js', 'Redis', 'SIP'],
      link: '#',
      github: '#',
      featured: false,
      stats: {
        calls: '50K concurrent',
        quality: 'HD Voice',
        uptime: '99.95%'
      }
    },
  ];

  useEffect(() => {
    setProjects(sampleProjects);

    // Animate project cards on scroll
    gsap.fromTo(
      '.project-card',
      {
        opacity: 0,
        y: 60,
        scale: 0.95,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
      }
    );
  }, []);

  const categories = [
    { id: 'all', name: 'All Projects' },
    { id: 'web', name: 'Web Development' },
    { id: 'cloud', name: 'Cloud' },
    { id: 'iot', name: 'IoT' },
    { id: 'telecom', name: 'Telecom' },
  ];

  const filteredProjects = activeFilter === 'all'
    ? projects
    : projects.filter(p => p.category === activeFilter);

  return (
    <section
      id="portfolio"
      ref={sectionRef}
      className="py-32 px-6 bg-[#030305] relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <Code className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-400 tracking-wider uppercase">
              Our Work
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Projects</span>
          </h2>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Transforming businesses through innovative technology solutions. Here's a showcase of our recent work.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveFilter(category.id)}
              className={`px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 ${
                activeFilter === category.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className="project-card group relative bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/5 hover:border-cyan-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-2"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent"></div>

                {/* Featured Badge */}
                {project.featured && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Featured
                  </div>
                )}

                {/* Overlay Links */}
                <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <a
                    href={project.link}
                    className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all"
                    aria-label="View project"
                  >
                    <ExternalLink className="w-5 h-5 text-white" />
                  </a>
                  <a
                    href={project.github}
                    className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all"
                    aria-label="View source code"
                  >
                    <Github className="w-5 h-5 text-white" />
                  </a>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                  {project.title}
                </h3>

                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-white/5 rounded-xl">
                  {Object.entries(project.stats).map(([key, value], idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-cyan-400 font-bold text-sm">{value}</div>
                      <div className="text-gray-500 text-xs capitalize">{key}</div>
                    </div>
                  ))}
                </div>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.slice(0, 3).map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-medium rounded-full border border-cyan-500/20"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="px-3 py-1 bg-white/5 text-gray-400 text-xs font-medium rounded-full">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>

                {/* View Details Link */}
                <a
                  href={project.link}
                  className="inline-flex items-center gap-2 text-cyan-400 text-sm font-semibold hover:gap-3 transition-all duration-300"
                >
                  View Case Study
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-16">
          <button className="group px-8 py-4 bg-white/5 text-white font-semibold rounded-full border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300 flex items-center gap-3 mx-auto">
            Load More Projects
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
