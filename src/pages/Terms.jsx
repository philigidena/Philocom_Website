import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const Terms = () => {
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
            Terms of Service
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="leading-relaxed">
                By accessing or using the services provided by Philocom Technology ("Company," "we," "us," or "our"),
                you agree to be bound by these Terms of Service. If you disagree with any part of these terms,
                you may not access our services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Services</h2>
              <p className="leading-relaxed">
                Philocom Technology provides technology consulting, software development, cloud computing,
                cybersecurity, VoIP & communication solutions, and related IT services. The specific scope,
                deliverables, and terms of each service engagement will be outlined in a separate service
                agreement or statement of work.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Client Responsibilities</h2>
              <p className="leading-relaxed mb-4">As a client, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and complete information necessary for service delivery</li>
                <li>Respond to requests for information or approvals in a timely manner</li>
                <li>Maintain confidentiality of any access credentials provided</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Pay for services as agreed in the service agreement</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Intellectual Property</h2>
              <p className="leading-relaxed">
                Unless otherwise specified in a separate agreement, all intellectual property rights in
                the deliverables created specifically for you will be transferred upon full payment.
                We retain all rights to our pre-existing intellectual property, methodologies, tools,
                and general know-how.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Confidentiality</h2>
              <p className="leading-relaxed">
                Both parties agree to maintain confidentiality of any proprietary or sensitive information
                shared during the course of the engagement. This obligation survives the termination of
                any service agreement.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payment Terms</h2>
              <p className="leading-relaxed mb-4">Payment terms include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Payment terms will be specified in individual service agreements</li>
                <li>Invoices are due within 30 days unless otherwise agreed</li>
                <li>Late payments may incur additional charges</li>
                <li>We reserve the right to suspend services for overdue payments</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Warranties and Disclaimers</h2>
              <p className="leading-relaxed">
                We warrant that our services will be performed in a professional manner consistent
                with industry standards. However, we do not warrant that our services will be
                uninterrupted, error-free, or meet all of your requirements. TO THE MAXIMUM EXTENT
                PERMITTED BY LAW, WE DISCLAIM ALL OTHER WARRANTIES, EXPRESS OR IMPLIED.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, PHILOCOM TECHNOLOGY SHALL NOT BE
                LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
                OR ANY LOSS OF PROFITS OR REVENUES. Our total liability shall not exceed the amounts
                paid by you for the services in the twelve (12) months preceding the claim.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Termination</h2>
              <p className="leading-relaxed">
                Either party may terminate a service agreement with written notice as specified in
                the agreement. Upon termination, you shall pay for all services rendered up to the
                termination date. We may immediately terminate services for material breach or
                non-payment.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
              <p className="leading-relaxed">
                These Terms of Service shall be governed by and construed in accordance with the
                laws of Ethiopia. Any disputes arising from these terms shall be resolved in the
                courts of Addis Ababa, Ethiopia.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. Changes will
                be effective upon posting to our website. Your continued use of our services
                constitutes acceptance of the modified terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="leading-relaxed">
                For questions about these Terms of Service, please contact us:
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

export default Terms;
