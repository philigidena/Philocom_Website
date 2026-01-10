import { useEffect, useRef, useState } from 'react';
import { TrendingUp, Users, Award, Calendar } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Stats = () => {
  const sectionRef = useRef();
  const [hasAnimated, setHasAnimated] = useState(false);

  const stats = [
    {
      icon: TrendingUp,
      value: 50,
      suffix: '+',
      label: 'Projects Delivered',
      description: 'Successful implementations',
      gradient: 'from-cyan-400 to-cyan-600'
    },
    {
      icon: Users,
      value: 30,
      suffix: '+',
      label: 'Happy Clients',
      description: 'Businesses transformed',
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      icon: Award,
      value: 98,
      suffix: '%',
      label: 'Client Satisfaction',
      description: 'Average satisfaction rating',
      gradient: 'from-blue-500 to-blue-700'
    },
    {
      icon: Calendar,
      value: 7,
      suffix: '+',
      label: 'Years Experience',
      description: 'Since 2017',
      gradient: 'from-blue-600 to-cyan-500'
    },
  ];

  const [counters, setCounters] = useState(stats.map(() => 0));

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate stat cards
      gsap.fromTo('.stat-card',
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateCounters();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [hasAnimated]);

  const animateCounters = () => {
    stats.forEach((stat, index) => {
      let current = 0;
      const increment = stat.value / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          current = stat.value;
          clearInterval(timer);
        }
        setCounters((prev) => {
          const newCounters = [...prev];
          newCounters[index] = Math.floor(current);
          return newCounters;
        });
      }, 30);
    });
  };

  return (
    <section
      ref={sectionRef}
      className="py-20 px-6 bg-[#030305] relative overflow-hidden"
    >
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Background orbs */}
      <div className="absolute top-1/2 left-[10%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-[10%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] -translate-y-1/2" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div
                key={index}
                className="stat-card group relative"
              >
                {/* Gradient border effect */}
                <div className={`absolute -inset-[1px] bg-gradient-to-r ${stat.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`} />
                <div className={`absolute -inset-[1px] bg-gradient-to-r ${stat.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Card content */}
                <div className="relative p-6 md:p-8 bg-[#0a0a0f] rounded-2xl border border-white/[0.06] group-hover:border-transparent transition-all duration-500 h-full">
                  {/* Gradient accent on hover */}
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 rounded-bl-[60px] transition-opacity duration-500`} />

                  {/* Animated line */}
                  <div className={`absolute left-0 top-0 w-1 h-0 bg-gradient-to-b ${stat.gradient} group-hover:h-full transition-all duration-700 rounded-l-2xl`} />

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} p-[1px] mb-5`}>
                      <div className="w-full h-full rounded-xl bg-[#0a0a0f] flex items-center justify-center group-hover:bg-transparent transition-colors duration-500">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    {/* Counter */}
                    <div className="mb-2">
                      <span className={`text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${stat.gradient}`}>
                        {counters[index]}
                      </span>
                      <span className={`text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${stat.gradient}`}>
                        {stat.suffix}
                      </span>
                    </div>

                    {/* Label */}
                    <h3 className="text-white font-bold text-base mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                      {stat.label}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-500 text-sm group-hover:text-gray-400 transition-colors duration-300">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Stats;
