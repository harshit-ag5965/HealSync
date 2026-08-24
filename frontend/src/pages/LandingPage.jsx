import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [count, setCount] = useState({ patients: 0, doctors: 0, appointments: 0 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const targets = { patients: 10000, doctors: 500, appointments: 50000 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setCount({
        patients: Math.floor(targets.patients * progress),
        doctors: Math.floor(targets.doctors * progress),
        appointments: Math.floor(targets.appointments * progress),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen font-sans overflow-x-hidden">

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
  scrolled ? "bg-white shadow-lg border-b border-gray-100" : "bg-transparent"
}`}>
  <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
    
    {/* New Logo Integration */}
    <div className="scale-75 origin-left">
      <Logo darkMode={!scrolled} sidebarOpen={true} />
    </div>

    <div className="hidden md:flex items-center gap-8">
      {["Features", "How it Works", "Roles"].map(item => (
        <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
          className={`text-sm font-medium hover:text-blue-400 transition ${scrolled ? "text-gray-600" : "text-white"}`}>
          {item}
        </a>
      ))}
    </div>
    
    <div className="flex items-center gap-3">
      <button onClick={() => navigate("/login")}
        className={`text-sm font-semibold px-5 py-2 rounded-xl transition ${
          scrolled ? "text-blue-600 hover:bg-blue-50" : "text-white hover:bg-white hover:bg-opacity-10"
        }`}>
        Login
      </button>
      <button onClick={() => navigate("/register")}
        className="bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200">
        Get Started →
      </button>
    </div>
  </div>
</nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{background: "linear-gradient(135deg, #0f4c81 0%, #1a6bb5 40%, #2196F3 70%, #0d47a1 100%)"}}>

        {/* Animated background circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400 rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-300 rounded-full opacity-10 animate-pulse" style={{animationDelay: "1s"}}></div>
          <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-blue-500 rounded-full opacity-10 animate-pulse" style={{animationDelay: "2s"}}></div>

          {/* Grid pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-full px-4 py-2 mb-8">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">Trusted by 500+ Healthcare Professionals</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Next-Gen Hospital
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-300">
              Management System
            </span>
          </h1>

          <p className="text-blue-100 text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Revolutionize your healthcare operations with AI-powered scheduling,
            real-time notifications, and seamless patient management.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <button onClick={() => navigate("/register")}
              className="group bg-white text-blue-700 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
              Start For Free
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button onClick={() => navigate("/login")}
              className="bg-white bg-opacity-10 backdrop-blur-sm border-2 border-white border-opacity-30 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-opacity-20 transition-all duration-300">
              Login to Dashboard
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            {[
              { value: count.patients.toLocaleString() + "+", label: "Patients" },
              { value: count.doctors + "+", label: "Doctors" },
              { value: count.appointments.toLocaleString() + "+", label: "Appointments" },
            ].map((stat) => (
              <div key={stat.label}
                className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-2xl p-5">
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <p className="text-blue-200 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 40C1440 40 1080 0 720 0C360 0 0 40 0 40L0 80Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Features</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2">Everything You Need</h2>
            <p className="text-gray-500 mt-4 text-lg max-w-xl mx-auto">A complete healthcare management solution built for the modern hospital</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "📅", title: "Smart Scheduling", desc: "Book, reschedule and manage appointments with automated email reminders 24hrs before.", gradient: "from-blue-500 to-blue-600" },
              { icon: "👨‍⚕️", title: "Doctor Management", desc: "Complete doctor profiles, earnings dashboard, and specialization-based filtering.", gradient: "from-cyan-500 to-blue-500" },
              { icon: "📁", title: "Medical Records", desc: "Securely upload and store medical records on cloud. Access anytime, anywhere.", gradient: "from-blue-600 to-indigo-600" },
              { icon: "💳", title: "Smart Billing", desc: "Auto-generate professional invoices when appointments complete. Download as PDF.", gradient: "from-indigo-500 to-blue-600" },
              { icon: "🔔", title: "Live Notifications", desc: "Real-time bell notifications and emails for every appointment status change.", gradient: "from-blue-500 to-cyan-500" },
              { icon: "📊", title: "Analytics & Reports", desc: "Beautiful charts showing revenue, appointments, and doctor performance metrics.", gradient: "from-blue-700 to-blue-500" },
            ].map((feature) => (
              <div key={feature.title}
                className="group relative bg-white rounded-3xl p-8 border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl mb-5 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6"
        style={{background: "linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%)"}}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Process</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2">How It Works</h2>
            <p className="text-gray-500 mt-4 text-lg">Get started in 3 simple steps</p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-300 to-blue-500"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "01", icon: "✍️", title: "Register", desc: "Create your account as patient, doctor, or admin in under 60 seconds." },
                { step: "02", icon: "🔍", title: "Find & Book", desc: "Search doctors by specialization, view profiles, and book your slot instantly." },
                { step: "03", icon: "💊", title: "Get Care", desc: "Attend your appointment, receive automated bill, download records anytime." },
              ].map((item, i) => (
                <div key={item.step} className="text-center relative">
                  <div className="relative inline-block mb-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center text-5xl mx-auto shadow-xl">
                      {item.icon}
                    </div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full border-2 border-blue-500 flex items-center justify-center">
                      <span className="text-blue-600 font-black text-sm">{item.step}</span>
                    </div>
                  </div>
                  <h3 className="font-black text-gray-900 text-2xl mb-3">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-24 bg-white px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Portals</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2">Built For Everyone</h2>
            <p className="text-gray-500 mt-4 text-lg">Three dedicated dashboards for each role</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "👤", role: "Patient Portal", color: "blue",
                gradient: "from-blue-500 to-blue-700",
                features: ["Book & reschedule appointments", "Upload medical records", "View & pay bills", "Get appointment reminders", "Search doctors by specialty"]
              },
              {
                icon: "👨‍⚕️", role: "Doctor Portal", color: "cyan",
                gradient: "from-cyan-500 to-blue-600",
                features: ["Manage all appointments", "View patient records", "Track monthly earnings", "Reschedule appointments", "View patient history"]
              },
              {
                icon: "🛡️", role: "Admin Portal", color: "indigo",
                gradient: "from-indigo-500 to-blue-700",
                features: ["Full doctor management", "View all patient records", "Analytics & revenue charts", "Manage appointments", "System-wide control"]
              },
            ].map((r) => (
              <div key={r.role}
                className="relative rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className={`bg-gradient-to-br ${r.gradient} p-8 text-white`}>
                  <div className="text-5xl mb-3">{r.icon}</div>
                  <h3 className="font-black text-2xl">{r.role}</h3>
                </div>
                <div className="p-6 bg-white">
                  <ul className="space-y-3">
                    {r.features.map(f => (
                      <li key={f} className="flex items-center gap-3 text-gray-600">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 text-xs font-bold">✓</span>
                        </div>
                        <span className="text-sm">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate("/register")}
                    className={`mt-6 w-full bg-gradient-to-r ${r.gradient} text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200`}>
                    Get Started →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6" style={{background: "linear-gradient(135deg, #0f4c81 0%, #1565c0 100%)"}}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-300 font-semibold text-sm uppercase tracking-widest">Testimonials</span>
            <h2 className="text-4xl font-black text-white mt-2">What People Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Dr. Rakesh Gupta", role: "Cardiologist", text: "HealSync has completely transformed how I manage my appointments. The earnings dashboard is incredibly useful.", avatar: "👨‍⚕️" },
              { name: "Harshit Agarwal", role: "Patient", text: "Booking appointments is so easy now. I love getting email reminders before my visits!", avatar: "👤" },
              { name: "Admin Team", role: "Hospital Admin", text: "The analytics charts give us a clear picture of hospital performance. Highly recommended!", avatar: "🛡️" },
            ].map((t) => (
              <div key={t.name}
                className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-2xl">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-white">{t.name}</p>
                    <p className="text-blue-300 text-sm">{t.role}</p>
                  </div>
                </div>
                <p className="text-blue-100 leading-relaxed text-sm">"{t.text}"</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-white text-center">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-16 shadow-2xl">
            <h2 className="text-4xl font-black text-white mb-4">Ready to Transform Your Hospital?</h2>
            <p className="text-blue-200 text-lg mb-10">Join thousands of healthcare professionals already using HealSync.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={() => navigate("/register")}
                className="bg-white text-blue-700 px-10 py-4 rounded-2xl font-black text-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                Create Free Account →
              </button>
              <button onClick={() => navigate("/login")}
                className="border-2 border-white border-opacity-40 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:bg-opacity-10 transition-all duration-300">
                Login Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 px-8 py-12">
  <div className="max-w-6xl mx-auto">
    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
      
      {/* Footer Logo */}
      <div className="scale-90">
        <Logo darkMode={true} sidebarOpen={true} />
      </div>

      <div className="flex gap-8 text-sm">
        {["Features", "How it Works", "Login", "Register"].map(item => (
          <a key={item} href="#!" className="hover:text-white transition">{item}</a>
        ))}
      </div>
      <p className="text-sm">© 2026 HealSync. All rights reserved.</p>
    </div>
  </div>
</footer>

    </div>
  );
};

export default LandingPage;
