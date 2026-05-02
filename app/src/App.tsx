import React, { useEffect, useState } from "react";
import { ReactLenis } from "@studio-freight/react-lenis";
import { motion, useScroll, useSpring } from "framer-motion";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Terminal from "./components/Terminal";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Docs from "./components/Docs"; // <- новый компонент

export default function App() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    const [route, setRoute] = useState<string>(() => (typeof window !== "undefined" ? (window.location.hash || "#home") : "#home"));

    useEffect(() => {
        const onHash = () => setRoute(window.location.hash || "#home");
        window.addEventListener("hashchange", onHash);
        return () => window.removeEventListener("hashchange", onHash);
    }, []);

    // helper: check if current route is docs
    const isDocs = route.startsWith("#docs");

    return (
        <ReactLenis root options={{ lerp: 0.1, duration: 1.2 }}>
            <motion.div className="scroll-progress" style={{ scaleX }} />

            <div className="app-wrapper site-root">
                <Header />

                {isDocs ? (
                    // Docs view replaces main panels
                    <main style={{ paddingTop: 100 }}>
                        <Docs />
                    </main>
                ) : (
                    <main className="panels-root">
                        <section className="panel" id="home">
                            <div className="panel-inner">
                                <Hero />
                            </div>
                        </section>

                        <section className="panel" id="terminal">
                            <div className="panel-inner">
                                <Terminal />
                            </div>
                        </section>

                        <section className="panel" id="features">
                            <div className="panel-inner">
                                <Features />
                            </div>
                        </section>
                    </main>
                )}

                <Footer />
            </div>
        </ReactLenis>
    );
}
