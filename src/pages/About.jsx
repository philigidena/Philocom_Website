import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Eye, Users, Award, CheckCircle } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const values = [
    {
      icon: Target,
      title: 'Innovation',
      description: 'We constantly push boundaries to deliver cutting-edge solutions that drive business growth.'
    },
    {
      icon: Users,
      title: 'Client-Centric',
      description: 'Your success is our priority. We build lasting partnerships based on trust and results.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We maintain the highest standards in every project, ensuring quality and reliability.'
    },
    {
      icon: Eye,
      title: 'Transparency',
      description: 'Open communication and honest practices are the foundation of our relationships.'
    }
  ];

  const milestones = [
    { year: '2017', title: 'Founded', description: 'Philocom Technology was established in Addis Ababa, Ethiopia.' },
    { year: '2018', title: 'First Major Project', description: 'Successfully delivered our first enterprise cloud solution.' },
    { year: '2020', title: 'Regional Expansion', description: 'Expanded services across East Africa with new partnerships.' },
    { year: '2022', title: '100+ Clients', description: 'Reached milestone of serving over 100 satisfied clients.' },
    { year: '2024', title: 'AI Integration', description: 'Launched AI automation services and intelligent solutions.' },
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
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Philocom</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-3xl leading-relaxed">
            Empowering businesses through innovative technology solutions since 2017.
            We are a leading technology company based in Addis Ababa, Ethiopia, dedicated to
            driving digital transformation across Africa.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-[#030305]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="p-8 md:p-10 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-2xl border border-cyan-500/20">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-gray-400 leading-relaxed">
                To empower businesses with innovative technology solutions that drive growth,
                efficiency, and competitive advantage. We strive to be the trusted technology
                partner for organizations seeking digital transformation in Africa and beyond.
              </p>
            </div>

            <div className="p-8 md:p-10 bg-gradient-to-br from-blue-500/10 to-transparent rounded-2xl border border-blue-500/20">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6">
                <Eye className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Our Vision</h2>
              <p className="text-gray-400 leading-relaxed">
                To be the leading technology company in Africa, recognized for our innovative
                solutions, exceptional service, and commitment to driving digital transformation
                that creates lasting value for our clients and communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at Philocom
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="p-6 md:p-8 bg-gray-50 rounded-2xl border border-gray-200 hover:border-gray-900 transition-all duration-300 hover:shadow-xl"
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-gray-900" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Journey */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-[#030305]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Our Journey
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Key milestones in Philocom's growth story
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-cyan-500 to-blue-500"></div>

            <div className="space-y-8 md:space-y-0">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`md:flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-cyan-500/50 transition-all duration-300">
                      <span className="text-cyan-400 font-bold text-lg">{milestone.year}</span>
                      <h3 className="text-xl font-bold text-white mt-2 mb-2">{milestone.title}</h3>
                      <p className="text-gray-400 text-sm">{milestone.description}</p>
                    </div>
                  </div>

                  {/* Timeline dot */}
                  <div className="hidden md:flex w-4 h-4 rounded-full bg-cyan-500 border-4 border-[#030305] z-10"></div>

                  <div className="md:w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Why Choose Philocom?
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                With years of experience and a dedicated team of experts, we deliver
                technology solutions that transform businesses and drive sustainable growth.
              </p>

              <div className="space-y-4">
                {[
                  'Expert team with diverse technical skills',
                  'Proven track record of successful projects',
                  '24/7 support and maintenance',
                  'Tailored solutions for your specific needs',
                  'Competitive pricing with transparent costs',
                  'Long-term partnership approach'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-gray-50 rounded-2xl text-center">
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">7+</div>
                <div className="text-gray-600 text-sm">Years Experience</div>
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl text-center">
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">200+</div>
                <div className="text-gray-600 text-sm">Happy Clients</div>
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl text-center">
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">500+</div>
                <div className="text-gray-600 text-sm">Projects Delivered</div>
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl text-center">
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">98%</div>
                <div className="text-gray-600 text-sm">Client Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-gray-400 mb-8">
            Let's discuss how Philocom can help you achieve your digital transformation goals.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/#contact"
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              Get in Touch
            </Link>
            <Link
              to="/#services"
              className="px-8 py-4 bg-white/10 text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all"
            >
              View Services
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
