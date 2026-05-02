import React from "react";
import { ReactLenis } from "@studio-freight/react-lenis";
import { motion, useScroll, useSpring } from "framer-motion";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Terminal from "./components/Terminal";
import Features from "./components/Features";
import Footer from "./components/Footer";

export default function App() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    return (
        <ReactLenis root options={{ lerp: 0.1, duration: 1.2 }}>
            {/* Индикатор прогресса */}
            <motion.div className="scroll-progress" style={{ scaleX }} />

            <div className="app-wrapper site-root">
                <Header />

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

                <Footer />
            </div>
        </ReactLenis>
    );
}
