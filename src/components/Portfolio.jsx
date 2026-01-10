import { useState, useEffect, useRef } from 'react';
import { ExternalLink, ArrowRight, Code, Zap, ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fallback sample projects when API is unavailable
const fallbackProjects = [
  {
    id: '1',
    title: 'AfriTutors',
    category: 'Web Development',
    description: 'Educational platform connecting African students with quality tutors across the continent.',
    image: 'https://api.microlink.io/?url=https://afritutors.com&screenshot=true&meta=false&embed=screenshot.url&waitForTimeout=5000',
    technologies: ['React', 'Node.js', 'MongoDB', 'WebRTC'],
    link: 'https://afritutors.com',
    featured: true,
  },
  {
    id: '2',
    title: 'AfriTutors Learning Portal',
    category: 'Web Development',
    description: 'Advanced learning management system with interactive courses and real-time collaboration.',
    image: 'https://api.microlink.io/?url=https://learn.afritutors.com&screenshot=true&meta=false&embed=screenshot.url&waitForTimeout=5000',
    technologies: ['Next.js', 'PostgreSQL', 'AWS', 'Tailwind'],
    link: 'https://learn.afritutors.com',
    featured: true,
  },
  {
    id: '3',
    title: 'ZG Business Group',
    category: 'Web Development',
    description: 'Corporate website for business consulting and investment firm with modern design.',
    image: 'https://api.microlink.io/?url=https://www.zgbusinessgroup.com&screenshot=true&meta=false&embed=screenshot.url&waitForTimeout=5000',
    technologies: ['React', 'Vite', 'Tailwind', 'GSAP'],
    link: 'https://www.zgbusinessgroup.com',
    featured: true,
  },
  {
    id: '4',
    title: 'Horizon SACCO',
    category: 'Web Development',
    description: 'Modern banking and financial services platform for savings and credit cooperative organization.',
    image: 'https://api.microlink.io/?url=https://horizon-sacco.vercel.app&screenshot=true&meta=false&embed=screenshot.url&waitForTimeout=5000',
    technologies: ['Next.js', 'TypeScript', 'Tailwind', 'Vercel'],
    link: 'https://horizon-sacco.vercel.app',
    featured: true,
  },
  {
    id: '5',
    title: 'Enterprise Cloud Migration',
    category: 'Cloud',
    description: 'Migrated legacy infrastructure to AWS cloud, reducing costs by 40% and improving performance.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    technologies: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
    link: null,
    featured: false,
  },
  {
    id: '6',
    title: 'IoT Security Platform',
    category: 'IoT',
    description: 'End-to-end IoT security solution monitoring 10,000+ devices in real-time.',
    image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800&q=80',
    technologies: ['IoT', 'Node.js', 'MongoDB', 'MQTT'],
    link: null,
    featured: false,
  },
];

const Portfolio = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProject, setHoveredProject] = useState(null);
  const sectionRef = useRef();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/projects`);
        if (response.ok) {
          const data = await response.json();
          if (data.projects && data.projects.length > 0) {
            setProjects(data.projects);
          } else {
            setProjects(fallbackProjects);
          }
        } else {
          setProjects(fallbackProjects);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects(fallbackProjects);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    if (!loading && projects.length > 0) {
      const ctx = gsap.context(() => {
        // Animate section header
        gsap.fromTo('.portfolio-header',
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
            }
          }
        );

        // Animate project cards with stagger
        gsap.fromTo('.project-card',
          { opacity: 0, y: 80, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '.projects-grid',
              start: 'top 75%',
            }
          }
        );
      }, sectionRef);

      return () => ctx.revert();
    }
  }, [loading, projects]);

  const categories = [
    { id: 'all', name: 'All Projects' },
    { id: 'Web Development', name: 'Web Development' },
    { id: 'Cloud', name: 'Cloud' },
    { id: 'IoT', name: 'IoT' },
    { id: 'Telecom', name: 'Telecom' },
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
      {/* Background effects */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="portfolio-header text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8">
            <Code className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-gray-400 tracking-wider uppercase">
              Our Portfolio
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Featured{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
              Projects
            </span>
          </h2>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Transforming businesses through innovative technology solutions.
            Here's a showcase of our recent work.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveFilter(category.id)}
              className={`relative px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 ${
                activeFilter === category.id
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white bg-white/[0.02] border border-white/[0.06] hover:border-white/10'
              }`}
            >
              {activeFilter === category.id && (
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full" />
              )}
              <span className="relative z-10">{category.name}</span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-32">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin" />
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && (
          <div className="projects-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="project-card group relative"
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                {/* Gradient border effect */}
                <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/50 via-blue-500/50 to-purple-500/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Card content */}
                <div className="relative bg-[#0a0a0f] rounded-2xl overflow-hidden border border-white/[0.06] group-hover:border-transparent transition-all duration-500">
                  {/* Image Container */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={project.image || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80'}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />

                    {/* Top gradient for featured badge */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />

                    {/* Featured Badge */}
                    {project.featured && (
                      <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg shadow-cyan-500/25">
                        <Zap className="w-3 h-3" />
                        Featured
                      </div>
                    )}

                    {/* Category badge */}
                    <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-sm text-white/80 text-xs font-medium rounded-full border border-white/10">
                      {project.category}
                    </div>

                    {/* Hover overlay with link */}
                    <div className={`absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300 ${
                      hoveredProject === project.id ? 'opacity-100' : 'opacity-0'
                    }`}>
                      {project.link && project.link !== '#' && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold text-sm rounded-full hover:scale-105 transition-transform"
                        >
                          View Project
                          <ArrowUpRight className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-400 transition-all duration-300">
                      {project.title}
                    </h3>

                    <p className="text-gray-400 text-sm leading-relaxed mb-5 line-clamp-2">
                      {project.description}
                    </p>

                    {/* Technologies */}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-5">
                        {project.technologies.slice(0, 3).map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-white/[0.03] text-gray-400 text-xs font-medium rounded-full border border-white/[0.06] group-hover:border-cyan-500/20 group-hover:text-cyan-400/80 transition-all duration-300"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="px-3 py-1 bg-white/[0.02] text-gray-500 text-xs font-medium rounded-full">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* View link */}
                    {project.link && project.link !== '#' && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-gray-400 text-sm font-medium group-hover:text-cyan-400 transition-colors"
                      >
                        <span>View Case Study</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Projects CTA */}
        {!loading && filteredProjects.length > 0 && (
          <div className="text-center mt-16">
            <a
              href="/contact"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white/[0.02] backdrop-blur-sm text-white font-semibold rounded-full border border-white/10 hover:border-cyan-400/50 hover:bg-white/[0.04] transition-all duration-300"
            >
              <span>Start Your Project</span>
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 group-hover:bg-cyan-500/20 transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default Portfolio;
