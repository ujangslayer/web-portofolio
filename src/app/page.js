"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const SparkleIcon = () => (
  <svg className="w-8 h-8 text-cyan-400 mx-auto mb-6 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

export default function Portfolio() {
  const container = useRef();
  const [activeAccordion, setActiveAccordion] = useState("skill");
  const [loadingText, setLoadingText] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Daftar kata untuk efek Typewriter dinamis
  const words = ["Manajemen Informasi", "Software Developer", "Problem Solver"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleScroll = (sectionId, accordionId = null) => {
    if (accordionId) setActiveAccordion(accordionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // 1. SIMULASI PRELOADER ANGKA PERCENT
  useEffect(() => {
    let start = 0;
    const end = 100;
    const duration = 1500; 
    const incrementTime = Math.floor(duration / end);

    const timer = setInterval(() => {
      start += 1;
      setLoadingText(start);
      if (start === end) {
        clearInterval(timer);
        gsap.to(".preloader-panel", {
          yPercent: -100,
          duration: 1,
          ease: "power4.inOut",
          onComplete: () => setIsLoading(false),
        });
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, []);

  // 2. TIMEOUT TYPEWRITER EFFECT
  useEffect(() => {
    if (isLoading) return;

    let timer;
    const handleType = () => {
      const fullWord = words[currentWordIndex];
      
      if (!isDeleting) {
        setCurrentText(fullWord.substring(0, currentText.length + 1));
        if (currentText === fullWord) {
          timer = setTimeout(() => setIsDeleting(true), 2000);
          return;
        }
      } else {
        setCurrentText(fullWord.substring(0, currentText.length - 1));
        if (currentText === "") {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
          return;
        }
      }

      timer = setTimeout(handleType, isDeleting ? 50 : 100);
    };

    timer = setTimeout(handleType, 100);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, isLoading]);

  // 3. SMOOTH SCROLL LENIS
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  // 4. GSAP SCROLL & FLOATING ANIMATIONS
  useGSAP(() => {
    if (isLoading) return;

    gsap.from(".hero-element", {
      y: 40, opacity: 0, duration: 1.2, stagger: 0.15, ease: "power3.out",
    });

    gsap.to(".floating-text", {
      y: -15, duration: 2.5, repeat: -1, yoyo: true, ease: "sine.inOut"
    });

    gsap.to(".parallax-bg", {
      y: 100,
      ease: "none",
      scrollTrigger: {
        trigger: "#home",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    gsap.utils.toArray(".gsap-fade-up").forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 85%" },
        y: 40, opacity: 0, duration: 1, ease: "power2.out",
      });
    });
  }, { scope: container, dependencies: [isLoading] });

  // 5. MOUSE MOVE FOR 3D TILT EFFECT
  const handleMouseMove = (e) => {
    const card = e.currentTarget; 
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    const rotateX = (-y / (box.height / 2)) * 10;
    const rotateY = (x / (box.width / 2)) * 10;

    gsap.to(card, {
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    gsap.to(card, {
      transform: `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      duration: 0.5,
      ease: "power2.out"
    });
  };

  const glassClass = "bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-2xl shadow-cyan-950/10";

  return (
    <main ref={container} className="relative bg-slate-950 text-slate-300 font-sans selection:bg-cyan-500 selection:text-slate-950 min-h-screen overflow-hidden">
      
      {/* FULL SCREEN PRELOADER PANEL */}
      <div className="preloader-panel fixed inset-0 bg-slate-950 z-[999] flex flex-col items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-4 font-mono">
            {loadingText}%
          </div>
          <div className="w-48 h-[2px] bg-slate-800 mx-auto rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-cyan-400 transition-all duration-75"
              style={{ width: `${loadingText}%` }}
            ></div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.15); }
          66% { transform: translate(-30px, 30px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 12s infinite alternate; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>

      {/* BLOBS BACKGROUND */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-cyan-900/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob"></div>
        <div className="absolute top-[30%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-900/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[15%] w-[40rem] h-[40rem] bg-slate-900/30 rounded-full mix-blend-screen filter blur-[150px] animate-blob animation-delay-4000"></div>
      </div>

      {/* HEADER NAVBAR */}
      <nav className="fixed top-6 left-0 w-full z-50 flex justify-center px-4">
        <div className={`flex items-center justify-between w-full max-w-6xl px-4 py-3 md:px-8 md:py-4 rounded-3xl md:rounded-full ${glassClass} hover:bg-slate-900/80 transition-colors`}>
          
          <div onClick={() => handleScroll('home')} className="flex items-center gap-2 cursor-pointer group shrink-0">
            <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full group-hover:animate-ping"></div>
            <span className="text-sm font-bold tracking-widest text-white uppercase hidden md:block">Fauzan</span>
          </div>

          <ul className="flex items-center gap-6 md:gap-8 text-xs md:text-sm font-semibold text-slate-400 overflow-x-auto scrollbar-hide whitespace-nowrap px-4 md:px-0">
            <li onClick={() => handleScroll('home')} className="cursor-pointer hover:text-cyan-400 hover:-translate-y-0.5 transition-all">Home</li>
            <li onClick={() => handleScroll('about')} className="cursor-pointer hover:text-cyan-400 hover:-translate-y-0.5 transition-all">About</li>
            <li onClick={() => handleScroll('project')} className="cursor-pointer hover:text-cyan-400 hover:-translate-y-0.5 transition-all">Project</li>
            <li onClick={() => handleScroll('details', 'skill')} className="cursor-pointer hover:text-cyan-400 hover:-translate-y-0.5 transition-all">Skill</li>
            <li onClick={() => handleScroll('details', 'pendidikan')} className="cursor-pointer hover:text-cyan-400 hover:-translate-y-0.5 transition-all">Pendidikan</li>
            <li onClick={() => handleScroll('details', 'sertifikat')} className="cursor-pointer hover:text-cyan-400 hover:-translate-y-0.5 transition-all">Sertifikat</li>
            <li onClick={() => handleScroll('contact')} className="cursor-pointer text-cyan-400 md:hidden transition-all">Contact</li>
          </ul>

          <button onClick={() => handleScroll('contact')} className="hidden md:flex bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-2.5 text-sm font-bold rounded-full items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] shrink-0">
            Contact Me
          </button>
        </div>
      </nav>

      {/* 1. HOME SECTION */}
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6">
        <div className="text-center z-10 max-w-5xl mx-auto relative w-full flex flex-col items-center mt-10 md:mt-0">
          
          {/* CONTAINER RELATIF UNTUK GAMBAR & TEKS AGAR PRESISI */}
          <div className="relative flex items-center justify-center w-full min-h-[40vh] md:min-h-[55vh] mb-8">
            
            {/* GAMBAR FAUZAN DI BELAKANG (Parallax Effect) */}
            <div className="absolute inset-0 flex items-center justify-center -z-10 parallax-bg pointer-events-none select-none">
              <div className="relative w-64 h-64 md:w-[450px] md:h-[450px]">
                {/* Glow/Aura di belakang gambar */}
                <div className="absolute inset-0 bg-cyan-500/30 rounded-full blur-[80px] md:blur-[120px] animate-pulse"></div>
                
                {/* Gambar dengan efek masking pudar dan pewarnaan */}
                <img 
                  src="fauzan.png" 
                  alt="Fauzan Adzim" 
                  className="w-full h-full object-cover opacity-70 mix-blend-luminosity grayscale-[20%]"
                  style={{
                    WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 75%)",
                    maskImage: "radial-gradient(circle at center, black 40%, transparent 75%)"
                  }}
                />
              </div>
            </div>

            {/* TEKS FAUZAN DI DEPAN */}
            <h1 className="hero-element floating-text text-7xl md:text-[10rem] lg:text-[12rem] leading-none font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-500 drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] select-none">
              UJANG
            </h1>

          </div>

          {/* KOTAK SUB-JUDUL */}
          <div className={`hero-element mx-auto w-full max-w-xl p-8 rounded-[2rem] hover:bg-slate-900/80 transition-colors duration-500 ${glassClass}`}>
            <p className="text-base md:text-lg text-slate-400 leading-relaxed min-h-[56px] flex items-center justify-center">
              Mahasiswa&nbsp;
              <span className="font-bold text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] border-r-2 border-cyan-400 pr-1 animate-pulse whitespace-nowrap">
                {currentText}
              </span>
              &nbsp;yang merancang pengalaman digital cerdas, mulus, dan efisien.
            </p>
          </div>
        </div>
      </section>

      {/* 2. ABOUT SECTION */}
      <section id="about" className="py-32 px-6 max-w-5xl mx-auto text-center">
        <div className="gsap-fade-up">
          <SparkleIcon />
          <h2 className="text-lg md:text-xl lg:text-2xl leading-tight font-medium text-slate-200">
           Saya Fauzan Adzim, mahasiswa D3 Manajemen Informatika di <span className="text-cyan-400 font-bold">Universitas Lampung</span>. Fokus pada pengembangan web dan desain UI/UX. Aku sangat menikmati proses mengubah ide menjadi sistem yang intuitif dan fungsional. Saat ini, aku terus mengeksplorasi teknologi terbaru untuk menciptakan solusi digital yang efektif.
          </h2>
          <div className="flex flex-wrap justify-center gap-4 mt-12">
            {['Management Informatics Student', 'Full-Stack Web Developer', 'UI/UX Enthusiast'].map((tag, i) => (
              <span key={i} className={`px-6 py-3 rounded-2xl text-sm font-semibold text-slate-300 transition-all duration-300 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-slate-800/50 hover:-translate-y-1 cursor-default ${glassClass}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PROJECTS SECTION */}
      <section id="project" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20 gsap-fade-up">
          <SparkleIcon />
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white">Projects</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          
          {/* Card 1: Laundry Cepat */}
          <a 
            href="https://github.com/ujangslayer/LaundryCepat" 
            target="_blank" 
            rel="noopener noreferrer"
            onMouseMove={handleMouseMove} 
            onMouseLeave={handleMouseLeave}
            className={`block p-6 md:p-8 rounded-[2rem] group transition-shadow duration-500 gsap-fade-up will-change-transform cursor-pointer ${glassClass}`}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="w-full h-[240px] bg-slate-950 rounded-2xl mb-8 overflow-hidden relative border border-slate-800" style={{ transform: "translateZ(30px)" }}>
              <img src="laundry.jpeg" className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" alt="Laundry Cepat" />
              <div className="absolute inset-0 bg-cyan-950/40 mix-blend-overlay group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
            <p className="text-cyan-400 font-bold text-xs tracking-widest uppercase mb-3" style={{ transform: "translateZ(20px)" }}>Web App</p>
            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors" style={{ transform: "translateZ(25px)" }}>Laundry Cepat</h3>
            <p className="text-slate-400 mb-8 leading-relaxed text-sm" style={{ transform: "translateZ(15px)" }}>Website Laundry online yang terintegrasi PHP dengan framwork Laravel & PostgreSQL dengan UI yang bersih dan responsif.</p>
            <div className="flex flex-wrap gap-2" style={{ transform: "translateZ(10px)" }}>
              <span className="px-3 py-1.5 bg-slate-950 rounded-xl text-xs font-bold text-slate-400 border border-slate-800">PHP</span>
              <span className="px-3 py-1.5 bg-slate-950 rounded-xl text-xs font-bold text-slate-400 border border-slate-800">PostgreSQL</span>
            </div>
          </a>

          {/* Card 2: Krider */}
          <a 
            href="https://github.com/ujangslayer/PrakTAM_2407051014" 
            target="_blank" 
            rel="noopener noreferrer"
            onMouseMove={handleMouseMove} 
            onMouseLeave={handleMouseLeave}
            className={`block p-6 md:p-8 rounded-[2rem] group transition-shadow duration-500 gsap-fade-up will-change-transform cursor-pointer md:mt-12 lg:mt-0 ${glassClass}`}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="w-full h-[240px] bg-slate-950 rounded-2xl mb-8 overflow-hidden relative border border-slate-800" style={{ transform: "translateZ(30px)" }}>
              <img src="Krider.png" className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" alt="Krider" />
              <div className="absolute inset-0 bg-cyan-950/40 mix-blend-overlay group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
            <p className="text-cyan-400 font-bold text-xs tracking-widest uppercase mb-3" style={{ transform: "translateZ(20px)" }}>Mobile App</p>
            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors" style={{ transform: "translateZ(25px)" }}>Krider</h3>
            <p className="text-slate-400 mb-8 leading-relaxed text-sm" style={{ transform: "translateZ(15px)" }}>Pengembangan perangkat lunak Mobile berbasis kotlin mennggunakan Jetpack Compose.</p>
            <div className="flex flex-wrap gap-2" style={{ transform: "translateZ(10px)" }}>
              <span className="px-3 py-1.5 bg-slate-950 rounded-xl text-xs font-bold text-slate-400 border border-slate-800">Kotlin</span>
            </div>
          </a>
 {/* Card 2: Krider */}
          <a 
            href="https://github.com/ujangslayer/Sistem-Informasi-Kepegawaian" 
            target="_blank" 
            rel="noopener noreferrer"
            onMouseMove={handleMouseMove} 
            onMouseLeave={handleMouseLeave}
            className={`block p-6 md:p-8 rounded-[2rem] group transition-shadow duration-500 gsap-fade-up will-change-transform cursor-pointer md:mt-12 lg:mt-0 ${glassClass}`}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="w-full h-[240px] bg-slate-950 rounded-2xl mb-8 overflow-hidden relative border border-slate-800" style={{ transform: "translateZ(30px)" }}>
              <img src="pbo.jpeg" className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" alt="Krider" />
              <div className="absolute inset-0 bg-cyan-950/40 mix-blend-overlay group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
            <p className="text-cyan-400 font-bold text-xs tracking-widest uppercase mb-3" style={{ transform: "translateZ(20px)" }}>Desktop App</p>
            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors" style={{ transform: "translateZ(25px)" }}>Sistem Informasi Kepegawaian</h3>
            <p className="text-slate-400 mb-8 leading-relaxed text-sm" style={{ transform: "translateZ(15px)" }}>Pengembangan perangkat lunak Desktop berbasis Java.</p>
            <div className="flex flex-wrap gap-2" style={{ transform: "translateZ(10px)" }}>
              <span className="px-3 py-1.5 bg-slate-950 rounded-xl text-xs font-bold text-slate-400 border border-slate-800">Java</span>
               <span className="px-3 py-1.5 bg-slate-950 rounded-xl text-xs font-bold text-slate-400 border border-slate-800">JavaFX</span>
            </div>
          </a>

        </div>
      </section>

      {/* 4. DETAILS SECTION */}
      <section id="details" className="py-32 max-w-4xl mx-auto px-6 gsap-fade-up">
        <div className={`p-8 md:p-12 rounded-[3rem] hover:bg-slate-900/70 transition-colors duration-700 ${glassClass}`}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-white">The Details</h2>
            <p className="text-slate-400 mt-4 font-medium">Pondasi, pendidikan, dan sertifikasi keahlian.</p>
          </div>

          <div className="space-y-4">
            {/* Akordion 1 */}
            <div className="bg-slate-950/50 rounded-2xl overflow-hidden border border-slate-800 shadow-sm transition-colors hover:border-cyan-900/50">
              <button onClick={() => setActiveAccordion(activeAccordion === "skill" ? "" : "skill")} className="w-full p-6 flex justify-between items-center text-left hover:bg-slate-900/40 transition-colors">
                <span className={`text-xl md:text-2xl font-bold transition-colors ${activeAccordion === "skill" ? "text-cyan-400" : "text-white"}`}>Technical Skills</span>
                <span className={`transform transition-transform duration-500 text-cyan-400 text-2xl font-light ${activeAccordion === "skill" ? "rotate-45" : ""}`}>+</span>
              </button>
              <div className={`transition-all duration-500 ease-in-out px-6 ${activeAccordion === "skill" ? "max-h-[800px] pb-6 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="flex flex-wrap gap-3 pt-2">
                  {['Microsoft Office','PHP','C++','Figma','Jetpack Compose','Laravel','PostgreSQL', 'MySQL', 'Java', 'JavaFX', 'Next.js', 'Tailwind','Burp Suite',].map(skill => (
                    <div key={skill} className="bg-slate-900 shadow-sm px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 border border-slate-800/80 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors cursor-default">{skill}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Akordion 2: Pendidikan (Diperbaiki strukturnya agar gabung jadi 1) */}
            <div className="bg-slate-950/50 rounded-2xl overflow-hidden border border-slate-800 shadow-sm transition-colors hover:border-cyan-900/50">
              <button onClick={() => setActiveAccordion(activeAccordion === "pendidikan" ? "" : "pendidikan")} className="w-full p-6 flex justify-between items-center text-left hover:bg-slate-900/40 transition-colors">
                <span className={`text-xl md:text-2xl font-bold transition-colors ${activeAccordion === "pendidikan" ? "text-cyan-400" : "text-white"}`}>Pendidikan</span>
                <span className={`transform transition-transform duration-500 text-cyan-400 text-2xl font-light ${activeAccordion === "pendidikan" ? "rotate-45" : ""}`}>+</span>
              </button>
              <div className={`transition-all duration-500 ease-in-out px-6 ${activeAccordion === "pendidikan" ? "max-h-[800px] pb-6 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="flex flex-col gap-4">
                  <div className="bg-slate-900/40 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center border border-slate-800/60 hover:bg-slate-900/60 transition-colors">
                    <div>
                      <h4 className="text-lg font-bold text-white">Universitas Lampung</h4>
                      <p className="text-cyan-400 mt-1 font-medium">D3 Manajemen Informatika</p>
                    </div>
                    <p className="text-slate-400 text-sm mt-4 md:mt-0 font-bold bg-slate-900 px-5 py-2 rounded-xl shadow-sm border border-slate-800">2024 - Sekarang</p>
                  </div>
                  
                  <div className="bg-slate-900/40 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center border border-slate-800/60 hover:bg-slate-900/60 transition-colors">
                    <div>
                      <h4 className="text-lg font-bold text-white">SMAN 1 Pagelaran</h4>
                      <p className="text-cyan-400 mt-1 font-medium">MIPA</p>
                    </div>
                    <p className="text-slate-400 text-sm mt-4 md:mt-0 font-bold bg-slate-900 px-5 py-2 rounded-xl shadow-sm border border-slate-800">2021 - 2024</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Akordion 3 */}
            <div className="bg-slate-950/50 rounded-2xl overflow-hidden border border-slate-800 shadow-sm transition-colors hover:border-cyan-900/50">
              <button onClick={() => setActiveAccordion(activeAccordion === "sertifikat" ? "" : "sertifikat")} className="w-full p-6 flex justify-between items-center text-left hover:bg-slate-900/40 transition-colors">
                <span className={`text-xl md:text-2xl font-bold transition-colors ${activeAccordion === "sertifikat" ? "text-cyan-400" : "text-white"}`}>Sertifikasi & Program</span>
                <span className={`transform transition-transform duration-500 text-cyan-400 text-2xl font-light ${activeAccordion === "sertifikat" ? "rotate-45" : ""}`}>+</span>
              </button>
              <div className={`transition-all duration-500 ease-in-out px-6 ${activeAccordion === "sertifikat" ? "max-h-[800px] pb-6 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="bg-slate-900/40 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center border border-slate-800/60 hover:bg-slate-900/60 transition-colors">
                  <div>
                    <h4 className="text-lg font-bold text-white">Introduction to Cybersecurity</h4>
                    <p className="text-slate-500 mt-1 text-sm font-medium leading-relaxed max-w-lg">
                      Safer Internet Day, International Day of Education - Introduction to Cybersecurity - BPPTIK, Indonesia
                    </p>
                  </div>
                  <p className="text-slate-400 text-sm mt-4 md:mt-0 font-bold bg-slate-900 px-5 py-2 rounded-xl shadow-sm border border-slate-800">2026</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. CONTACT ME */}
      <section id="contact" className="py-32 px-6 gsap-fade-up">
        <div className={`max-w-3xl mx-auto rounded-[3rem] p-10 md:p-16 relative overflow-hidden text-center hover:bg-slate-900/70 transition-colors duration-500 ${glassClass}`}>
          <SparkleIcon />
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">Let's build something.</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto font-medium">Saya selalu terbuka untuk mendiskusikan peluang kolaborasi, proyek pengembangan web, atau inovasi digital lainnya.</p>
          
          {/* SOCIAL MEDIA LINKS */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <a 
              href="mailto:adzimf3@gmail.com" 
              className="flex items-center gap-2 px-5 py-3 bg-slate-900 border border-slate-800 rounded-full hover:border-cyan-500/50 hover:text-cyan-400 transition-all hover:-translate-y-1 group"
            >
              <svg className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <span className="text-sm font-bold">Email</span>
            </a>
            
            <a 
              href="https://www.instagram.com/fauzqnnz?igsh=c2RpbGhicjdzcTcy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 bg-slate-900 border border-slate-800 rounded-full hover:border-pink-500/50 hover:text-pink-400 transition-all hover:-translate-y-1 group"
            >
              <svg className="w-5 h-5 text-slate-400 group-hover:text-pink-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="2"></rect>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2"></line>
              </svg>
              <span className="text-sm font-bold">Instagram</span>
            </a>

            <a 
              href="https://www.facebook.com/share/p/1SgYAp3vHs/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 bg-slate-900 border border-slate-800 rounded-full hover:border-blue-500/50 hover:text-blue-400 transition-all hover:-translate-y-1 group"
            >
              <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
              </svg>
              <span className="text-sm font-bold">Facebook</span>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 text-center flex flex-col items-center border-t border-slate-900 mt-10">
        <p className="text-sm font-semibold text-slate-500">Fauzan Adzim. Dibuat biar keliatan keren</p>
      </footer>
      
    </main>
  );
}