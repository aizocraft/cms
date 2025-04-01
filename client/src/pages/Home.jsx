import React from "react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiCheck, FiSend, FiChevronRight } from "react-icons/fi";

// Fallback construction team image
const constructionTeamImage = "https://images.unsplash.com/photo-1581093450023-4c67e3a1d7f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

const Home = ({ user }) => {
  const navigate = useNavigate();
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const constraintsRef = useRef(null);

  // Hero images with reliable sources
  const heroData = [
    {
      title: "Construction Management Pro",
      subtitle: "Revolutionizing project coordination with real-time analytics",
      bgImage: "https://images.unsplash.com/photo-1605152276897-4f618f831968?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Joseph Kiama",
      subtitle: "BBIT Final Project - Next-Gen Construction Solutions",
      bgImage: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Smart Build Platform",
      subtitle: "Connecting engineers, architects, and finance teams seamlessly",
      bgImage: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];

  const features = [
    {
      title: "Blueprint Management",
      description: "Digitally store, version, and collaborate on construction blueprints",
      icon: "📐"
    },
    {
      title: "Expense Tracking",
      description: "Real-time budget monitoring with AI-powered insights",
      icon: "💰"
    },
    {
      title: "Team Coordination",
      description: "Unified communication hub for all stakeholders",
      icon: "👷"
    },
    {
      title: "Progress Analytics",
      description: "Live dashboards with milestone tracking",
      icon: "📊"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroData.length]);

  const goToDashboard = (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate("/login", { state: { from: "/" } });
      return;
    }

    // Ripple effect
    const button = e.currentTarget;
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    button.appendChild(ripple);
    
    const rect = button.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    
    setTimeout(() => {
      ripple.remove();
      switch (user.role) {
        case "admin":
          navigate("/admin-dashboard");
          break;
        case "engineer":
          navigate("/engineer-dashboard");
          break;
        case "finance":
          navigate("/finance-dashboard");
          break;
        default:
          navigate("/");
      }
    }, 500);
  };

  return (
    <div className="overflow-hidden" ref={constraintsRef}>
      <style>{`
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.7);
          transform: scale(0);
          animation: ripple 600ms linear;
          pointer-events: none;
        }
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        .gradient-border {
          position: relative;
        }
        .gradient-border::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(45deg, #3b82f6, #10b981);
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
      `}</style>

      {/* HERO SECTION */}
      <section className="relative h-screen overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHeroIndex}
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${heroData[currentHeroIndex].bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-black/40 backdrop-blur-[2px]"></div>
          </motion.div>
        </AnimatePresence>
        
        <div className="relative z-10 h-full flex items-center justify-center text-white px-6">
          <motion.div 
            className="text-center max-w-4xl"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {heroData[currentHeroIndex].title}
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-blue-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {heroData[currentHeroIndex].subtitle}
            </motion.p>
            <motion.button
              onClick={goToDashboard}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              className={`px-8 py-4 rounded-full text-lg font-semibold relative overflow-hidden ${
                user ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'
              } shadow-lg`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {user ? "Access Dashboard" : "Get Started"}
                <motion.span
                  animate={{ x: isHovering ? 5 : 0 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <FiArrowRight className="w-5 h-5" />
                </motion.span>
              </span>
              <motion.span
                className="absolute inset-0 bg-white/10"
                initial={{ width: 0 }}
                animate={{ width: isHovering ? '100%' : 0 }}
                transition={{ duration: 0.4 }}
              />
            </motion.button>
          </motion.div>

          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3">
            {heroData.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentHeroIndex(index)}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentHeroIndex ? 'bg-white w-8' : 'bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-semibold tracking-wider text-blue-600 uppercase">Why Choose Us</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-500">
              Premium Construction Management
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge technology with construction expertise.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className={`p-5 rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden ${
                    activeFeature === index ? 
                    'bg-white shadow-xl border border-blue-100' : 
                    'bg-white/70 hover:bg-white/90'
                  }`}
                  onClick={() => setActiveFeature(index)}
                  whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h3 className="font-semibold text-blue-800">{feature.title}</h3>
                  <AnimatePresence mode="wait">
                    {activeFeature === index && (
                      <motion.p 
                        className="text-sm text-gray-600 mt-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {feature.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              className="relative group"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl opacity-75 blur-xl group-hover:opacity-100 transition duration-700"></div>
              <motion.div 
                className="relative h-[500px] rounded-2xl overflow-hidden gradient-border"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <img 
                  src={constructionTeamImage}
                  alt="Construction team working" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-8">
                  <motion.div
                    drag
                    dragConstraints={constraintsRef}
                    dragElastic={0.1}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/20 backdrop-blur-lg rounded-xl p-5 border border-white/30 shadow-lg max-w-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100/80 p-2 rounded-lg">
                        <FiCheck className="text-blue-600 w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Project Milestone</h3>
                        <p className="text-white/80 text-sm mt-1">Foundation work completed ahead of schedule</p>
                      </div>
                    </div>
                    <motion.button 
                      whileHover={{ x: 5 }}
                      className="text-white/90 text-sm font-medium mt-3 flex items-center"
                    >
                      View details <FiChevronRight className="ml-1" />
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CONTACT US SECTION */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
        <motion.div 
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <span className="text-sm font-semibold tracking-wider text-blue-300 uppercase">Get In Touch</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3">Contact Our Team</h2>
            <p className="mt-4 text-lg text-blue-200 max-w-3xl mx-auto">
              Have questions about our platform? Reach out to our support team.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-500/20 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-blue-200">Phone</p>
                      <p className="font-medium">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-500/20 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-blue-200">Email</p>
                      <p className="font-medium">support@constructionpro.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {user && (
                <motion.div 
                  className="bg-gradient-to-br from-blue-600/30 to-emerald-500/30 rounded-2xl p-6 border border-white/10 backdrop-blur-md"
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="bg-white/10 p-1 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    Your Account
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-blue-200">Logged in as</p>
                      <p className="font-medium">{user.name || user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-200">Account type</p>
                      <p className="font-medium capitalize">{user.role}</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={goToDashboard}
                    whileHover={{ x: 5, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg px-4 py-3 text-left flex items-center justify-between transition-colors duration-300"
                  >
                    <span>Go to Dashboard</span>
                    <FiChevronRight className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              )}
            </motion.div>

            <motion.div 
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 400 }}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <form className="space-y-6">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <label htmlFor="name" className="block text-sm font-medium mb-2">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition duration-300"
                    required
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <label htmlFor="email" className="block text-sm font-medium mb-2">Your Email</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition duration-300"
                    required
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <label htmlFor="message" className="block text-sm font-medium mb-2">Your Message</label>
                  <textarea
                    id="message"
                    placeholder="How can we help you?"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition duration-300"
                    rows="5"
                    required
                  ></textarea>
                </motion.div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-400 to-emerald-400 text-white px-6 py-4 rounded-lg font-semibold hover:from-blue-500 hover:to-emerald-500 transition duration-300 flex items-center justify-center gap-3 relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Send Message
                    <FiSend className="w-5 h-5 ml-1" />
                  </span>
                  <motion.span
                    className="absolute inset-0 bg-white/20"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.4 }}
                  />
                </motion.button>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;