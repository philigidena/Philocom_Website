import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Briefcase, Users, Heart, Zap, Mail } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const Careers = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const benefits = [
    { icon: Heart, title: 'Health Insurance', description: 'Comprehensive health coverage for you and your family' },
    { icon: Zap, title: 'Growth Opportunities', description: 'Continuous learning and career advancement paths' },
    { icon: Users, title: 'Great Team', description: 'Work with talented and passionate professionals' },
    { icon: Clock, title: 'Flexible Hours', description: 'Work-life balance with flexible scheduling' },
  ];

  const openings = [
    {
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'Addis Ababa',
      type: 'Full-time',
      description: 'We are looking for experienced software engineers to join our team and build innovative solutions.',
    },
    {
      title: 'Cloud Solutions Architect',
      department: 'Cloud Services',
      location: 'Addis Ababa',
      type: 'Full-time',
      description: 'Design and implement scalable cloud infrastructure solutions for enterprise clients.',
    },
    {
      title: 'UI/UX Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      description: 'Create beautiful and intuitive user experiences for our web and mobile applications.',
    },
    {
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Addis Ababa',
      type: 'Full-time',
      description: 'Build and maintain CI/CD pipelines, automate deployments, and ensure system reliability.',
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 px-4 md:px-6 bg-gradient-to-b from-black to-[#030305]">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </Link>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            Join Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Team</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-3xl leading-relaxed">
            Be part of a dynamic team that's shaping the future of technology in Africa.
            We're always looking for talented individuals who share our passion for innovation.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Why Work at Philocom?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We offer a supportive environment where you can grow and thrive
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="p-6 md:p-8 bg-gray-50 rounded-2xl border border-gray-200 hover:border-gray-900 transition-all duration-300 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-[#030305]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Open Positions
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Explore current opportunities to join our team
            </p>
          </div>

          <div className="space-y-6">
            {openings.map((job, index) => (
              <div
                key={index}
                className="p-6 md:p-8 bg-white/5 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{job.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{job.description}</p>
                    <div className="flex flex-wrap gap-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                        <Briefcase className="w-3 h-3" />
                        {job.department}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                        <Clock className="w-3 h-3" />
                        {job.type}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`mailto:careers@philocom.co?subject=Application for ${job.title}`}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-cyan-500/50 transition-all text-center"
                  >
                    Apply Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Application */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Don't See a Fit?
          </h2>
          <p className="text-gray-600 mb-8">
            We're always interested in meeting talented people. Send us your resume
            and we'll keep you in mind for future opportunities.
          </p>
          <a
            href="mailto:careers@philocom.co?subject=Open Application"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all"
          >
            <Mail className="w-5 h-5" />
            Send Open Application
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;
