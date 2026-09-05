import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf8f5",
          padding: "20px",
          fontFamily: "system-ui, -apple-system, sans-serif"
        }}>
          <div style={{
            background: "#ffffff",
            padding: "36px",
            borderRadius: "16px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            maxWidth: "540px",
            textAlign: "center",
            border: "1px solid rgba(179, 135, 40, 0.3)"
          }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🌸</div>
            <h2 style={{ color: "#1c1917", fontSize: "1.5rem", marginBottom: "8px" }}>
              Refreshing VANSHRA Store
            </h2>
            <p style={{ color: "#78716c", fontSize: "0.9rem", marginBottom: "20px", lineHeight: 1.5 }}>
              A cached data conflict was detected. Click below to clear cache and reload the fresh showroom catalog.
            </p>
            <pre style={{
              background: "#f5f0ea",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "0.75rem",
              color: "#e11d48",
              textAlign: "left",
              overflowX: "auto",
              marginBottom: "24px"
            }}>
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={this.handleReset}
              style={{
                background: "linear-gradient(135deg, #dfba5d 0%, #b38728 100%)",
                color: "#ffffff",
                border: "none",
                padding: "12px 28px",
                borderRadius: "9999px",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(179, 135, 40, 0.3)"
              }}
            >
              Clear Cache & Launch Store
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
