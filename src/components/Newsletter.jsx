import { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate API call
      // const response = await fetch('/api/newsletter', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });

      setStatus('success');
      setMessage('Successfully subscribed! Check your inbox for confirmation.');
      setEmail('');

      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } catch (error) {
      setStatus('error');
      setMessage('Oops! Something went wrong. Please try again.');
    }
  };

  return (
    <section className="py-32 px-6 bg-gradient-to-br from-[#030305] via-[#0a0a0a] to-[#030305] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Main Card */}
        <div className="relative bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl p-12 md:p-16 border border-white/10 overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
          </div>

          <div className="relative z-10 text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-3xl mb-8 shadow-lg shadow-cyan-500/50 rotate-12 hover:rotate-0 transition-transform duration-500">
              <Mail className="w-10 h-10 text-white" />
            </div>

            {/* Heading */}
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Stay <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Ahead</span> of the Curve
            </h2>

            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Get the latest insights on technology trends, cybersecurity alerts, and exclusive industry reports delivered to your inbox.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {['Weekly Tech Insights', 'Security Alerts', 'Exclusive Resources', 'No Spam Ever'].map((benefit, idx) => (
                <div key={idx} className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 inline mr-2 text-green-400" />
                  {benefit}
                </div>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                    disabled={status === 'loading'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {status === 'loading' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Subscribing...
                    </>
                  ) : (
                    <>
                      Subscribe
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              {/* Status Messages */}
              {status === 'success' && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3 text-green-400">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{message}</p>
                </div>
              )}

              {status === 'error' && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{message}</p>
                </div>
              )}
            </form>

            {/* Privacy Note */}
            <p className="text-xs text-gray-500 mt-6">
              🔒 We respect your privacy. Unsubscribe anytime with one click.
            </p>
          </div>

          {/* Glow Effects */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
