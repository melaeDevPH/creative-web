import React, { useEffect, useRef } from 'react';
const FeaturesSection = () => {
    const bgRef = useRef(null);
    const sectionRef = useRef(null);

    useEffect(() => {
        const bg = bgRef.current;
        const section = sectionRef.current;
        if (!bg || !section) return;

        const circles = bg.querySelectorAll('.parallax-circle');
        const speeds = [0.18, -0.12, 0.25]; // negative = moves opposite direction

        const handleScroll = () => {
            const rect = section.getBoundingClientRect();
            const sectionCenter = rect.top + rect.height / 2;
            const viewportCenter = window.innerHeight / 2;
            const offset = viewportCenter - sectionCenter; // distance from center of screen

            circles.forEach((c, i) => {
                const y = offset * speeds[i];
                const x = offset * speeds[i] * 0.3; // slight horizontal drift too
                c.style.transform = `translate(${x}px, ${y}px)`;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const features = [
        { icon: '◈', title: 'Content Strategy', desc: 'We craft content systems that scale — from ideation to distribution, aligned with your audience.' },
        { icon: '⬡', title: 'Channel Growth', desc: 'Data-driven channel architecture that builds lasting audiences across every platform.' },
        { icon: '◉', title: 'Digital Lab', desc: 'We experiment fast — prototyping, testing, and shipping digital experiences that resonate.' },
    ];

    return (
        <section className="features-section-light" ref={sectionRef}>
            {/* Parallax blobs */}
            <div className="parallax-bg" ref={bgRef}>
                <div className="parallax-circle pc1" />
                <div className="parallax-circle pc2" />
                <div className="parallax-circle pc3" />
            </div>

            <div className="features-container-light">
                <h2 className="features-title-light">What We Build</h2>
                <div className="features-grid-light">
                    {features.map((f, i) => (
                        <div className="feature-card-light" key={i}>
                            <span className="feature-icon-light">{f.icon}</span>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;