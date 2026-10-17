import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import Container from './components/Layout/Container';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import DeadlineCalculator from './pages/DeadlineCalculator';
import CurrencyConverter from './pages/CurrencyConverter';
import XmlExtractor from './pages/XmlExtractor';
import XmlAnalyzer from './pages/XmlAnalyzer';

import ScrollToTop from './components/Layout/ScrollToTop';

function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />

      <main className="app-main">
        <Container>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/index.html" element={<Home />} />
            <Route
              path="/deadline-calculator"
              element={<DeadlineCalculator />}
            />

            <Route path="/currency-converter" element={<CurrencyConverter />} />
            <Route path="/xml-extractor" element={<XmlExtractor />} />
            <Route path="/xml-analyzer" element={<XmlAnalyzer />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </Container>
      </main>

      <Footer />
    </>
  );
}

export default App;
