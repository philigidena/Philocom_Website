import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from './components/Hero';
import About from './components/About';
import Mission from './components/Mission';
import CoreValues from './components/CoreValues';
import Services from './components/Services';
import WhyChooseUs from './components/WhyChooseUs';
import Contact from './components/Contact';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const appRef = useRef();

  useEffect(() => {
    // Smooth scroll animations
    const sections = appRef.current.querySelectorAll('.animate-section');

    sections.forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });
  }, []);

  return (
    <div ref={appRef} className="min-h-screen bg-navy-950">
      <Hero />
      <About />
      <Mission />
      <CoreValues />
      <Services />
      <WhyChooseUs />
      <Contact />
    </div>
  );
}

export default App;
