import React from 'react';
import WaterBackground from './Water';  // ← new import for the water backgrounds/ ← adjust path to match your project
import './styles/Hero.css';
import FeaturesSection from './Feature';



const Hero = () => {


  return (
    <>
      <section className="hero">

        {/* ✅ Water goes HERE — sibling to content, not inside it */}
        <WaterBackground />

        {/* ✅ Content sits on top via z-index */}
        <div className="hero-content glass">

          <h2 className="hero-brand">Vonas Media. V2</h2>
          <h1 className="hero-title text-draw">CONTENT</h1>

          {/* Original SVG — completely untouched */}
          <svg className="animated" viewBox="0 0 900 120">
            <defs>
              <clipPath id="textClip">
                <text x="0" y="100" textAnchor="start" fontFamily="Michroma, cursive" fontSize="120" fontWeight="800">CHANNEL</text>
              </clipPath>
              <filter id="smokeFilter" x="-5%" y="-50%" width="110%" height="200%">
                <feTurbulence type="fractalNoise" baseFrequency="0.018 0.05" numOctaves="4" seed="3" result="noise">
                  <animate attributeName="baseFrequency" values="0.018 0.05; 0.03 0.07; 0.018 0.05" dur="10s" begin="3s" repeatCount="indefinite" />
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" result="displaced" />
                <feGaussianBlur in="displaced" stdDeviation="1.2" />
              </filter>
              <linearGradient id="smokeGradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ff4500" stopOpacity="1" />
                <stop offset="25%" stopColor="#ffcc00" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#ff6a00" stopOpacity="0.9" />
                <stop offset="75%" stopColor="#ffb3c1" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#ff4500" stopOpacity="0" />
                <animate attributeName="x1" values="900; 0; 900" dur="8s" begin="3s" repeatCount="indefinite" />
                <animate attributeName="x2" values="1800; 900; 1800" dur="8s" begin="3s" repeatCount="indefinite" />
              </linearGradient>
            </defs>
            <text className="bold-text" x="0" y="100" textAnchor="start" fontFamily="Michroma, cursive" fontSize="120" pathLength="1">
              CHANNEL
            </text>
            <rect className="smoke-layer" x="0" y="0" width="900" height="120" fill="url(#smokeGradient)" filter="url(#smokeFilter)" clipPath="url(#textClip)" />
          </svg>

          <h1 className="hero-title">LAB</h1>

          <p className="hero-description">
            We build digital experiences that connect content, channels, and labs.
            Simple, fast, and ready for the future.
          </p>
          <button className="hero-button">Get Started</button>
        </div>



        {/* below this one */}

      </section>

      <FeaturesSection />
    </>
  );
};

export default Hero;