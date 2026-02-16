import React from 'react';

class SEOErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error but don't crash the app
    console.warn('SEO component error (non-critical):', error.message);
  }

  render() {
    if (this.state.hasError) {
      // Render nothing if there's an error - SEO is non-critical for rendering
      return null;
    }

    return this.props.children;
  }
}

export default SEOErrorBoundary;
