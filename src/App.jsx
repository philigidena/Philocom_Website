import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import Stats from './components/Stats';
import Mission from './components/Mission';
import CoreValues from './components/CoreValues';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import TechStack from './components/TechStack';
import Team from './components/Team';
import ClientsTestimonials from './components/ClientsTestimonials';
import WhyChooseUs from './components/WhyChooseUs';
import Newsletter from './components/Newsletter';
import Contact from './components/Contact';
import Footer from './components/Footer';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const appRef = useRef();

  useEffect(() => {
    // Smooth scroll animations for sections with animate-section class
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

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
          e.preventDefault();
          const element = document.querySelector(href);
          if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }
      });
    });
  }, []);

  return (
    <div ref={appRef} className="min-h-screen bg-[#030305]">
      <Navigation />
      <Hero />
      <Stats />
      <About />
      <Mission />
      <CoreValues />
      <Services />
      <Portfolio />
      <TechStack />
      <Team />
      <ClientsTestimonials />
      <WhyChooseUs />
      <Newsletter />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
