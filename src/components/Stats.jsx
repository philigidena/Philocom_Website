import { useEffect, useRef, useState } from 'react';
import { TrendingUp, Users, Award, Globe } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Stats = () => {
  const sectionRef = useRef();
  const [hasAnimated, setHasAnimated] = useState(false);

  const stats = [
    {
      icon: TrendingUp,
      value: 500,
      suffix: '+',
      label: 'Projects Delivered',
      description: 'Successful implementations worldwide',
      color: 'cyan'
    },
    {
      icon: Users,
      value: 200,
      suffix: '+',
      label: 'Happy Clients',
      description: 'Businesses transformed',
      color: 'blue'
    },
    {
      icon: Award,
      value: 98,
      suffix: '%',
      label: 'Client Satisfaction',
      description: 'Average satisfaction rating',
      color: 'purple'
    },
    {
      icon: Globe,
      value: 45,
      suffix: '+',
      label: 'Countries Served',
      description: 'Global reach and impact',
      color: 'green'
    },
  ];

  const [counters, setCounters] = useState(stats.map(() => 0));

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
      const increment = stat.value / 60; // 60 frames for smooth animation
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

  const getColorClasses = (color) => {
    const colors = {
      cyan: {
        bg: 'from-cyan-500/20 to-cyan-500/5',
        border: 'border-cyan-500/30',
        text: 'text-cyan-400',
        glow: 'shadow-cyan-500/50'
      },
      blue: {
        bg: 'from-blue-500/20 to-blue-500/5',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        glow: 'shadow-blue-500/50'
      },
      purple: {
        bg: 'from-purple-500/20 to-purple-500/5',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        glow: 'shadow-purple-500/50'
      },
      green: {
        bg: 'from-green-500/20 to-green-500/5',
        border: 'border-green-500/30',
        text: 'text-green-400',
        glow: 'shadow-green-500/50'
      },
    };
    return colors[color] || colors.cyan;
  };

  return (
    <section
      ref={sectionRef}
      className="py-20 px-6 bg-white relative"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const colorClasses = getColorClasses(stat.color);

            return (
              <div
                key={index}
                className="group relative"
              >
                <div className="p-8 bg-gray-50 rounded-3xl border border-gray-200 hover:border-gray-900 transition-all duration-500 hover:scale-105 hover:shadow-xl">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-gray-900" />
                  </div>

                  {/* Counter */}
                  <div className="mb-3">
                    <span className="text-5xl font-bold text-gray-900">
                      {counters[index]}
                    </span>
                    <span className="text-3xl font-bold text-gray-900">
                      {stat.suffix}
                    </span>
                  </div>

                  {/* Label */}
                  <h3 className="text-gray-900 font-bold text-lg mb-2">
                    {stat.label}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm">
                    {stat.description}
                  </p>
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
