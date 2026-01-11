import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Component, Suspense, lazy } from 'react';
import Home from './pages/Home';
import AboutPage from './pages/About';
import Careers from './pages/Careers';
import ContactPage from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

// Lazy load admin routes to prevent blocking main app
const AdminRoutes = lazy(() => import('./admin/AdminRoutes'));

// Error Boundary to catch render errors
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', background: '#fff' }}>
          <h1>Something went wrong</h1>
          <pre>{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<div>Loading admin...</div>}>
                <AdminRoutes />
              </Suspense>
            }
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
