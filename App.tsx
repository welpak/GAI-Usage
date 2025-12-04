import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlanType, ModelInfo, LatencyPoint } from './types';
import { MODELS, INITIAL_LATENCY_DATA } from './constants';
import { checkModelLatency } from './services/geminiService';
import { Gauge } from './components/Gauge';
import { LatencyChart } from './components/LatencyChart';
import { CarVisual } from './components/CarVisual';

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [selectedModelId, setSelectedModelId] = useState<string>(MODELS[0].id);
  const [planType, setPlanType] = useState<PlanType>(PlanType.FREE);
  const [latencyData, setLatencyData] = useState<LatencyPoint[]>(INITIAL_LATENCY_DATA);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [lastLatency, setLastLatency] = useState<number>(0);
  const [quotaError, setQuotaError] = useState<boolean>(false);
  const [sessionUsage, setSessionUsage] = useState<number>(0);
  const [systemStatus, setSystemStatus] = useState<string>("SYSTEM READY");

  // Stats derived from selection
  const selectedModel = MODELS.find(m => m.id === selectedModelId) || MODELS[0];
  const currentRPM = planType === PlanType.FREE ? selectedModel.rpmFree : selectedModel.rpmPay;
  const currentTPM = planType === PlanType.FREE ? selectedModel.tpmFree : selectedModel.tpmPay;
  const currentRPD = planType === PlanType.FREE ? selectedModel.rpdFree : selectedModel.rpdPay;

  // Check for API key on mount
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        // If not in AI Studio environment, assume env var might be present or handled elsewhere
        setHasKey(!!process.env.API_KEY);
      }
    };
    checkKey();
  }, []);

  const handleConnectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Assume success after dialog closes (race condition mitigation)
      setHasKey(true);
      performHealthCheck();
    }
  };

  const performHealthCheck = useCallback(async () => {
    if (isChecking || !hasKey) return;
    setIsChecking(true);
    setSystemStatus("PINGING...");
    
    try {
      const latency = await checkModelLatency(selectedModelId);
      setLastLatency(latency);
      setLatencyData(prev => {
        const newData = [...prev, { timestamp: Date.now(), latency, modelId: selectedModelId }];
        return newData.slice(-30); // Keep last 30 points
      });
      setQuotaError(false);
      setSystemStatus("ONLINE");
      setSessionUsage(prev => prev + 1); // Track local usage
    } catch (err: any) {
      if (err.message === "QUOTA_EXCEEDED") {
        setQuotaError(true);
        setSystemStatus("QUOTA EXCEEDED");
      } else if (err.message === "API_KEY_MISSING") {
        setHasKey(false);
        setSystemStatus("AUTH REQUIRED");
      } else {
        setSystemStatus("CONNECTION ERROR");
      }
      console.error("Health check failed", err);
    } finally {
      setIsChecking(false);
    }
  }, [selectedModelId, isChecking, hasKey]);

  // Initial and periodic check
  useEffect(() => {
    if (hasKey) {
      performHealthCheck();
      const interval = setInterval(performHealthCheck, 10000); // Check every 10s
      return () => clearInterval(interval);
    }
  }, [performHealthCheck, hasKey]);

  // Auth Lock Screen
  if (!hasKey) {
    return (
      <div className="w-screen h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>
        <div className="z-10 flex flex-col items-center max-w-md text-center p-8 border border-[#333] rounded-2xl bg-[#111]/80 backdrop-blur-md shadow-2xl">
          <div className="w-16 h-16 mb-6 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-widest mb-2">GEMINI QUOTA OS</h1>
          <p className="text-gray-500 mb-8 text-sm">
            Security clearance required. Please authenticate with your Google account credentials to access real-time quota monitoring.
          </p>
          <button 
            onClick={handleConnectKey}
            className="group relative px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              AUTHENTICATE
            </span>
          </button>
          <div className="mt-6 text-[10px] text-gray-600 uppercase tracking-widest">
            Access protected by Google Cloud Identity
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black text-white overflow-hidden flex flex-col md:flex-row">
      
      {/* LEFT SIDEBAR / CONTROL PANEL */}
      <div className="w-full md:w-80 bg-[#121212] border-r border-[#222] flex flex-col p-6 z-20 shadow-2xl relative">
        <div className="mb-8">
          <h1 className="text-xl font-bold tracking-widest text-gray-100 flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${quotaError ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></span>
            GEMINI OS
          </h1>
          <p className={`text-xs mt-1 transition-colors ${quotaError ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
            {systemStatus}
          </p>
        </div>

        {/* Plan Selector */}
        <div className="mb-8 p-1 bg-[#1a1a1a] rounded-lg flex border border-[#333]">
          {Object.values(PlanType).map((type) => (
            <button
              key={type}
              onClick={() => setPlanType(type)}
              className={`flex-1 py-2 text-xs font-medium rounded transition-all duration-300 ${
                planType === type 
                  ? 'bg-[#333] text-white shadow-lg' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Model Selector List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          <h2 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Active Modules</h2>
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => setSelectedModelId(model.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${
                selectedModelId === model.id 
                  ? quotaError ? 'bg-red-900/10 border-red-500/50' : 'bg-blue-900/10 border-blue-500/50' 
                  : 'bg-[#1c1c1c] border-transparent hover:border-[#333]'
              }`}
            >
              <div className="flex justify-between items-start mb-1 relative z-10">
                <span className={`font-semibold text-sm ${selectedModelId === model.id ? (quotaError ? 'text-red-400' : 'text-blue-400') : 'text-gray-300'}`}>
                  {model.name}
                </span>
                {selectedModelId === model.id && (
                  <span className="flex h-2 w-2 relative">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${quotaError ? 'bg-red-400' : 'bg-blue-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${quotaError ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 relative z-10">{model.description}</p>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t border-[#222]">
          <button 
            onClick={performHealthCheck}
            disabled={isChecking}
            className={`w-full py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors border ${
              quotaError 
                ? 'bg-red-900/20 border-red-800 text-red-400 hover:bg-red-900/40' 
                : 'bg-[#1c1c1c] hover:bg-[#252525] border-[#333] text-gray-300'
            }`}
          >
            {isChecking ? (
               <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
            {quotaError ? 'RETRY CONNECTION' : 'TEST CONNECTIVITY'}
          </button>
        </div>
      </div>

      {/* MAIN DASHBOARD AREA */}
      <div className="flex-1 flex flex-col relative bg-[#0a0a0a]">
        
        {/* Top Status Bar */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10 pointer-events-none">
          <div>
             <h2 className="text-3xl font-light text-white">{selectedModel.name}</h2>
             <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    quotaError 
                      ? 'bg-red-900/30 text-red-400 border border-red-800'
                      : lastLatency < 500 
                        ? 'bg-green-900/30 text-green-400 border border-green-800' 
                        : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'
                }`}>
                    {quotaError ? 'LATENCY: HIGH (THROTTLED)' : `${lastLatency.toFixed(0)}ms Latency`}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-800 text-gray-400 border border-gray-700">
                    Region: Auto
                </span>
             </div>
          </div>
          <div className="text-right">
             <div className="text-4xl font-light tracking-tighter">
                {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
             </div>
             <div className="text-sm text-gray-500 uppercase tracking-widest mt-1">
                {new Date().toLocaleDateString([], {weekday: 'long', month:'short', day:'numeric'})}
             </div>
          </div>
        </div>

        {/* Center Visual */}
        <div className="flex-1 relative">
           <CarVisual />
           {quotaError && (
             <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
               <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl backdrop-blur-md animate-pulse">
                  <h3 className="text-2xl font-bold tracking-widest text-center">QUOTA LIMIT REACHED</h3>
                  <p className="text-xs text-center mt-1 uppercase">Rate Limit Exceeded • Cool Down Required</p>
               </div>
             </div>
           )}
        </div>

        {/* Bottom Metrics Deck */}
        <div className="h-auto bg-[#121212]/80 backdrop-blur-xl border-t border-[#222] p-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
            
            {/* Column 1: Capacity Gauges */}
            <div className="col-span-1 grid grid-cols-2 gap-4">
                <div className="bg-[#1c1c1c] rounded-xl border border-[#333] p-2">
                    <Gauge 
                        value={currentRPM} 
                        max={currentRPM * 1.5} 
                        label="RPM Limit" 
                        subLabel="Req / Min"
                        color={quotaError ? "#ef4444" : "#3b82f6"}
                    />
                </div>
                <div className="bg-[#1c1c1c] rounded-xl border border-[#333] p-2">
                    <Gauge 
                        value={currentTPM} 
                        max={currentTPM * 1.2} 
                        label="TPM Limit" 
                        subLabel="Tokens / Min"
                        color={quotaError ? "#ef4444" : "#a855f7"}
                    />
                </div>
            </div>

            {/* Column 2: Chart */}
            <div className="col-span-1 md:col-span-1">
               <LatencyChart data={latencyData} />
            </div>

            {/* Column 3: Detailed Stats */}
            <div className="col-span-1 bg-[#1c1c1c] rounded-xl border border-[#333] p-5 flex flex-col justify-between">
                <div>
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Live Session Stats</h3>
                    <div className="space-y-4">
                         <div className="flex justify-between items-center border-b border-[#333] pb-2">
                             <span className="text-gray-500 text-sm">Session Requests</span>
                             <span className="text-white font-mono text-sm">
                                {sessionUsage}
                             </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-[#333] pb-2">
                             <span className="text-gray-500 text-sm">Requests / Day (Limit)</span>
                             <span className="text-white font-mono text-sm">
                                {currentRPD === -1 ? 'UNLIMITED' : currentRPD.toLocaleString()}
                             </span>
                        </div>
                        <div className="flex justify-between items-center pb-2">
                             <span className="text-gray-500 text-sm">Est. Cost (Input)</span>
                             <span className="text-white font-mono text-sm">
                                {planType === PlanType.FREE ? 'FREE' : 'PAY-AS-YOU-GO'}
                             </span>
                        </div>
                    </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-[#333]">
                   <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${hasKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-xs text-gray-400 uppercase tracking-wider">
                        SECURE CONNECTION • {planType} TIER
                      </span>
                   </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default App;