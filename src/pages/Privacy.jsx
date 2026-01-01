import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const Privacy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-8 md:pt-40 md:pb-12 px-4 md:px-6 bg-gradient-to-b from-black to-[#030305]">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </Link>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Privacy Policy
          </h1>

          <p className="text-gray-400">
            Last updated: January 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-white">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <div className="space-y-8 text-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="leading-relaxed">
                Philocom Technology ("we," "our," or "us") is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your
                information when you visit our website or use our services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              <p className="leading-relaxed mb-4">We may collect information about you in various ways:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Personal Data:</strong> Name, email address, phone number, and other contact information you provide to us.</li>
                <li><strong>Usage Data:</strong> Information about how you interact with our website, including IP address, browser type, pages visited, and time spent.</li>
                <li><strong>Cookies:</strong> We use cookies and similar tracking technologies to enhance your experience on our website.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="leading-relaxed mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, operate, and maintain our services</li>
                <li>Improve, personalize, and expand our services</li>
                <li>Communicate with you about projects, services, and updates</li>
                <li>Send you marketing and promotional communications (with your consent)</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Protect against fraudulent or illegal activity</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing</h2>
              <p className="leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal information to third parties
                without your consent, except as described in this policy. We may share your information with:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Service providers who assist us in operating our website and conducting our business</li>
                <li>Legal authorities when required by law or to protect our rights</li>
                <li>Business partners with your explicit consent</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
              <p className="leading-relaxed">
                We implement appropriate technical and organizational security measures to protect
                your personal information against unauthorized access, alteration, disclosure, or
                destruction. However, no method of transmission over the Internet is 100% secure.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
              <p className="leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies</h2>
              <p className="leading-relaxed">
                Our website uses cookies to enhance your browsing experience. You can set your browser
                to refuse all or some browser cookies. If you disable or refuse cookies, some parts
                of this website may become inaccessible or not function properly.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Third-Party Links</h2>
              <p className="leading-relaxed">
                Our website may contain links to third-party websites. We are not responsible for the
                privacy practices or content of these external sites. We encourage you to review the
                privacy policy of every site you visit.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes
                by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
              <p className="leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <ul className="list-none mt-4 space-y-2">
                <li><strong>Email:</strong> info@philocom.co</li>
                <li><strong>Phone:</strong> +251 947 447 244</li>
                <li><strong>Address:</strong> Nile Source Building, 5th Floor, Africa AV / Bole Road, Addis Ababa, Ethiopia</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Privacy;
