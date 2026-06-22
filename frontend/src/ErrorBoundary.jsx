import React, { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="crash-shell">
          <section className="crash-panel">
            <h1>Frontend render error</h1>
            <p>{this.state.error.message}</p>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("threew-auth");
                window.location.reload();
              }}
            >
              Reset saved login
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
