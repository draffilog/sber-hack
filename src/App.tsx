import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Lock, Cpu } from 'lucide-react';
import { BackgroundGrid } from './components/BackgroundGrid';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { BlockchainContextProvider } from './context/BlockchainContext';
import { ProtocolProvider } from './context/ProtocolContext';

// Landing page component
const LandingPage = () => {
  const navigate = useNavigate();
  
  const handleStartScanning = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-[#0A0F16] text-white relative overflow-hidden">
      <BackgroundGrid />
      
      <div className="relative z-10">
        <Navbar />
        
        <main className="container mx-auto px-4 pt-20 pb-32">
          <div className="max-w-4xl mx-auto text-center mb-24">
            <div className="inline-flex items-center bg-cyan-500/10 rounded-full px-4 py-2 mb-8">
              <Shield className="w-4 h-4 text-cyan-400 mr-2" />
              <span className="text-cyan-400 text-sm">Secure. Analyze. Protect.</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200">
                SH1FR
              </span>
              <br />
              Smart Contract Security Scanner
            </h1>
            
            <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
              Analyze and secure your smart contracts with military-grade precision. 
              Detect vulnerabilities before they become threats.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-gray-900 rounded-lg font-bold transition-all transform hover:scale-105 flex items-center"
                onClick={handleStartScanning}
              >
                Start Scanning
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button className="px-8 py-4 border border-gray-700 hover:border-cyan-400 rounded-lg font-bold transition-all flex items-center">
                View Documentation
              </button>
            </div>
            
            <div className="mt-8 py-3 px-4 bg-cyan-500/10 rounded-lg inline-block">
              <p className="text-cyan-300 text-sm font-medium">
                Developed specially for the Sber DeFi Hackathon by draffilog
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6 hover:border-cyan-500/50 transition-all"
              >
                <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-32 text-center">
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl font-bold text-cyan-400 mb-2">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Dashboard page wrapper with required context providers
const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-[#0A0F16] text-white">
      <BackgroundGrid />
      <div className="relative z-10">
        <Navbar />
        <div className="container mx-auto px-4 pt-20 pb-32">
          <BlockchainContextProvider>
            <ProtocolProvider>
              <Dashboard />
            </ProtocolProvider>
          </BlockchainContextProvider>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

const features = [
  {
    icon: Shield,
    title: "Vulnerability Detection",
    description: "Advanced scanning algorithms identify potential security risks and vulnerabilities in your smart contracts."
  },
  {
    icon: Lock,
    title: "Real-time Monitoring",
    description: "Continuous monitoring of contract changes and suspicious activities with instant alerts."
  },
  {
    icon: Cpu,
    title: "AI-Powered Analysis",
    description: "Machine learning algorithms analyze patterns and predict potential security threats before they occur."
  }
];

const stats = [
  {
    value: "100K+",
    label: "Contracts Scanned"
  },
  {
    value: "99.9%",
    label: "Accuracy Rate"
  },
  {
    value: "24/7",
    label: "Monitoring"
  }
];

export default App;