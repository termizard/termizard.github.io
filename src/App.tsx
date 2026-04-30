import Header from "./components/Header";
import Hero from "./components/Hero";
import Terminal from "./components/Terminal";
import Features from "./components/Features";
import Footer from "./components/Footer";

export default function App() {
    return (
        <div className="container">
            <Header />
            <Hero />
            <Terminal />
            <Features />
            <Footer />
        </div>
    );
}
