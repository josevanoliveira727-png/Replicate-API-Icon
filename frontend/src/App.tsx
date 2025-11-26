import { IconGenerator } from './components/IconGenerator';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1 className="app-title">
            <span className="gradient-text">Icon Generator</span>
          </h1>
          <p className="app-subtitle">
            Generate 4 matching icons from a single prompt
          </p>
        </div>
      </header>
      
      <main className="app-main">
        <div className="container">
          <IconGenerator />
        </div>
      </main>
      
      <footer className="app-footer">
        <div className="container">
          <p>Image Generation API</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
