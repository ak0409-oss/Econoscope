/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  BarChart3, 
  Cloud, 
  Droplets, 
  Info, 
  Leaf, 
  LayoutDashboard, 
  AlertTriangle,
  TrendingDown,
  Building2,
  ArrowRight,
  RefreshCw,
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { analyzeUrbanCapacity, EnvironmentalMetrics, AnalysisResult } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [metrics, setMetrics] = useState<EnvironmentalMetrics>({
    pm25: 35,
    pm10: 80,
    no2: 45,
    ndvi: 0.6,
    lst: 32,
    waterCapacity: 150,
    popDensity: 12000,
    roadDensity: 12,
    carbonIntensity: 120,
    plotArea: 1000,
  });

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const data = await analyzeUrbanCapacity(metrics);
      setResult(data);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  const chartData = [
    { name: 'PM2.5', value: metrics.pm25, limit: 60, unit: 'µg/m³' },
    { name: 'PM10', value: metrics.pm10, limit: 100, unit: 'µg/m³' },
    { name: 'NO2', value: metrics.no2, limit: 80, unit: 'µg/m³' },
    { name: 'NDVI', value: metrics.ndvi * 100, limit: 100, unit: '%' },
    { name: 'Water', value: metrics.waterCapacity, limit: 200, unit: 'L' },
  ];

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-[#141414] p-2 rounded-lg">
            <Building2 className="text-[#E4E3E0] w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase">EconoScope</h1>
            <p className="text-[10px] uppercase tracking-widest opacity-50 font-mono">Environmental Carrying Capacity Advisor</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] uppercase font-mono opacity-50">System Status</span>
            <span className="text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Operational
            </span>
          </div>
          <button 
            onClick={runAnalysis}
            disabled={loading}
            className="bg-[#141414] text-[#E4E3E0] px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Run Analysis
          </button>
        </div>
      </header>

      <main className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto">
        
        {/* Sidebar Inputs */}
        <section className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-[#141414] p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Multi-Modal Inputs
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-[10px] uppercase font-mono tracking-widest opacity-40 border-b border-[#141414]/10 pb-1">Environmental</p>
                <InputGroup 
                  label="PM2.5" 
                  value={metrics.pm25} 
                  onChange={(v: number) => setMetrics({...metrics, pm25: v})}
                  min={0} max={300} unit="µg/m³"
                  icon={<Cloud className="w-4 h-4" />}
                />
                <InputGroup 
                  label="NDVI (Green Cover)" 
                  value={metrics.ndvi} 
                  onChange={(v: number) => setMetrics({...metrics, ndvi: v})}
                  min={0} max={1} step={0.01} unit="Index"
                  icon={<Leaf className="w-4 h-4" />}
                />
                <InputGroup 
                  label="LST (Heat Island)" 
                  value={metrics.lst} 
                  onChange={(v: number) => setMetrics({...metrics, lst: v})}
                  min={20} max={50} unit="°C"
                  icon={<Activity className="w-4 h-4" />}
                />
              </div>

              <div className="space-y-4">
                <p className="text-[10px] uppercase font-mono tracking-widest opacity-40 border-b border-[#141414]/10 pb-1">Socio-Economic</p>
                <InputGroup 
                  label="Pop. Density" 
                  value={metrics.popDensity} 
                  onChange={(v: number) => setMetrics({...metrics, popDensity: v})}
                  min={1000} max={50000} unit="ppl/km²"
                  icon={<LayoutDashboard className="w-4 h-4" />}
                />
                <InputGroup 
                  label="Road Density" 
                  value={metrics.roadDensity} 
                  onChange={(v: number) => setMetrics({...metrics, roadDensity: v})}
                  min={1} max={30} unit="km/km²"
                  icon={<TrendingDown className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>

          <div className="bg-[#141414] text-[#E4E3E0] p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
            <h3 className="text-xs font-mono uppercase tracking-widest opacity-50 mb-4 flex items-center gap-2">
              <Info className="w-3 h-3" />
              ECC Score (Stage 1)
            </h3>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">{result?.eccScore.toFixed(0) || "--"}</div>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000" 
                  style={{ width: `${result?.eccScore || 0}%` }}
                />
              </div>
            </div>
            <p className="text-[10px] mt-2 opacity-50 uppercase tracking-wider">Environmental Carrying Capacity</p>
          </div>
        </section>

        {/* Main Dashboard Area */}
        <section className="lg:col-span-9 space-y-6">
          
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard 
              title="Recommended FAR" 
              value={result?.recommendedFar.toFixed(2) || "---"} 
              subtitle="Floor Area Ratio"
              trend={result?.recommendedFar && result.recommendedFar < 2.5 ? "Restricted" : "Optimal"}
              trendColor={result?.recommendedFar && result.recommendedFar < 2.5 ? "text-amber-600" : "text-emerald-600"}
            />
            <MetricCard 
              title="Building Height" 
              value={result?.equivalentFloors.toString() || "---"} 
              subtitle="Equivalent Floors"
              trend="Max Vertical"
              trendColor="text-[#141414]"
            />
            <MetricCard 
              title="Opportunity Cost" 
              value={result ? formatCurrency(result.opportunityCost) : "---"} 
              subtitle="Foregone Investment"
              trend="Hidden Loss"
              trendColor="text-rose-600"
            />
            <MetricCard 
              title="Infra Stress" 
              value={result ? `${result.infrastructureStress.toFixed(0)}%` : "---"} 
              subtitle="System Load"
              trend={result && result.infrastructureStress > 70 ? "High Load" : "Sustainable"}
              trendColor={result && result.infrastructureStress > 70 ? "text-rose-600" : "text-emerald-600"}
            />
          </div>

          {/* Charts & Analysis */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* Satellite View Simulation */}
            <div className="bg-white border border-[#141414] p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Satellite Analysis (Stage 3)
              </h3>
              <div className="aspect-video bg-[#141414] rounded-lg relative overflow-hidden group">
                {/* Simulated Satellite Grid */}
                <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 opacity-20">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div key={i} className="border-[0.5px] border-white/20" />
                  ))}
                </div>
                
                {/* Simulated Heatmap/NDVI */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="w-3/4 h-3/4 blur-3xl transition-all duration-1000"
                    style={{ 
                      background: `radial-gradient(circle, ${metrics.ndvi > 0.5 ? '#10b981' : '#f59e0b'} 0%, transparent 70%)`,
                      opacity: 0.4
                    }}
                  />
                </div>

                {/* Plot Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 border-2 border-white/50 rounded-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="text-[10px] font-mono text-white/80 bg-black/50 px-2 py-1 rounded">
                      PLOT ID: {Math.floor(Math.random() * 10000)}
                    </div>
                  </div>
                </div>

                {/* Metadata Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <span className="text-[10px] font-mono text-white/80">NDVI: {metrics.ndvi.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full" />
                      <span className="text-[10px] font-mono text-white/80">LST: {metrics.lst}°C</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-white/40 uppercase">Sentinel-2 10m Res</p>
                    <p className="text-[10px] font-mono text-white/80">LAT: 12.9716 N | LON: 77.5946 E</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-4">
                <div className="flex-1 bg-[#141414]/5 p-3 rounded-lg">
                  <p className="text-[10px] uppercase font-bold opacity-40 mb-1">Built-up Density</p>
                  <p className="text-sm font-bold">{(metrics.popDensity / 200).toFixed(1)}%</p>
                </div>
                <div className="flex-1 bg-[#141414]/5 p-3 rounded-lg">
                  <p className="text-[10px] uppercase font-bold opacity-40 mb-1">Vegetation Index</p>
                  <p className="text-sm font-bold">{metrics.ndvi > 0.5 ? "High" : "Low"}</p>
                </div>
              </div>
            </div>

            {/* AI Advisor Insight */}
            <div className="bg-white border border-[#141414] p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] flex flex-col">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                EconoScope AI Advisor
              </h3>
              <div className="flex-1 bg-[#F5F5F3] p-6 rounded-lg border border-[#141414]/10 relative overflow-hidden">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <RefreshCw className="w-8 h-8 animate-spin opacity-20" />
                    <p className="text-xs font-mono uppercase tracking-widest opacity-50">Synthesizing Economic Data...</p>
                  </div>
                ) : (
                  <>
                    <div className="relative z-10">
                      <p className="text-lg font-serif italic leading-relaxed text-[#141414]/80">
                        "{result?.aiInsight}"
                      </p>
                      <div className="mt-8 pt-6 border-t border-[#141414]/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#141414] flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-[#E4E3E0]" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider">Binding Constraint</p>
                            <p className="text-xs font-mono opacity-50">{result?.bindingConstraint}</p>
                          </div>
                        </div>
                        <button className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all">
                          Full Report <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Impact Analysis */}
          <div className="bg-white border border-[#141414] p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Economic Impact Matrix
              </h3>
              <span className="text-[10px] font-mono uppercase bg-[#141414] text-[#E4E3E0] px-2 py-1 rounded">
                Case Study Comparison
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#141414] text-[10px] uppercase tracking-widest font-mono opacity-50">
                    <th className="pb-4 font-normal">Metric</th>
                    <th className="pb-4 font-normal">Current Scenario</th>
                    <th className="pb-4 font-normal">Ideal Baseline</th>
                    <th className="pb-4 font-normal">Impact / Loss</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <TableRow 
                    label="Permissible Floor Space" 
                    current={result ? `${(result.recommendedFar * metrics.plotArea).toLocaleString()} m²` : "---"}
                    ideal={`${(4.0 * metrics.plotArea).toLocaleString()} m²`}
                    impact={result ? `-${((4.0 - result.recommendedFar) * metrics.plotArea).toLocaleString()} m²` : "---"}
                    isNegative
                  />
                  <TableRow 
                    label="Construction Investment" 
                    current={result ? formatCurrency(result.recommendedFar * metrics.plotArea * 3500) : "---"}
                    ideal={formatCurrency(4.0 * metrics.plotArea * 3500)}
                    impact={result ? `-${formatCurrency(result.opportunityCost)}` : "---"}
                    isNegative
                  />
                  <TableRow 
                    label="Annual GDP Contribution" 
                    current={result ? formatCurrency(result.gdpContribution) : "---"}
                    ideal={formatCurrency(4.0 * metrics.plotArea * 3500 * 0.1)}
                    impact={result ? `-${formatCurrency((4.0 - result.recommendedFar) * metrics.plotArea * 3500 * 0.1)}` : "---"}
                    isNegative
                  />
                  <TableRow 
                    label="Estimated Job Creation" 
                    current={result ? Math.floor(result.recommendedFar * 35).toString() : "---"}
                    ideal="140"
                    impact={result ? `-${140 - Math.floor(result.recommendedFar * 35)}` : "---"}
                    isNegative
                  />
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-[#141414] p-8 bg-white/30">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Building2 className="w-4 h-4" />
            <span className="text-[10px] uppercase font-mono tracking-widest">EconoScope v1.1.0 | Three-Stage ML Pipeline</span>
          </div>
          <div className="flex gap-8">
            <FooterLink label="Documentation" />
            <FooterLink label="Methodology" />
            <FooterLink label="Data Sources" />
            <FooterLink label="API Access" />
          </div>
        </div>
      </footer>
    </div>
  );
}

function InputGroup({ label, value, onChange, min, max, step = 1, unit, icon }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] uppercase font-bold tracking-wider opacity-60 flex items-center gap-1.5">
          {icon}
          {label}
        </label>
        <span className="text-xs font-mono font-bold bg-[#141414]/5 px-1.5 py-0.5 rounded">
          {value} {unit}
        </span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step} 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-[#141414]/10 rounded-lg appearance-none cursor-pointer accent-[#141414]"
      />
    </div>
  );
}

function MetricCard({ title, value, subtitle, trend, trendColor }: any) {
  return (
    <div className="bg-white border border-[#141414] p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] group hover:-translate-y-1 transition-transform">
      <p className="text-[10px] uppercase font-mono tracking-widest opacity-50 mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
        <span className="text-xs opacity-40 font-medium">{subtitle}</span>
      </div>
      <div className={cn("mt-4 pt-4 border-t border-[#141414]/5 flex items-center justify-between", trendColor)}>
        <span className="text-[10px] font-bold uppercase tracking-wider">{trend}</span>
        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}

function TableRow({ label, current, ideal, impact, isNegative }: any) {
  return (
    <tr className="border-b border-[#141414]/5 group hover:bg-[#141414]/[0.02] transition-colors">
      <td className="py-4 font-medium">{label}</td>
      <td className="py-4 font-mono text-xs">{current}</td>
      <td className="py-4 font-mono text-xs opacity-40">{ideal}</td>
      <td className={cn("py-4 font-mono text-xs font-bold", isNegative ? "text-rose-600" : "text-emerald-600")}>
        {impact}
      </td>
    </tr>
  );
}

function FooterLink({ label }: { label: string }) {
  return (
    <a href="#" className="text-[10px] uppercase font-bold tracking-widest opacity-40 hover:opacity-100 transition-opacity">
      {label}
    </a>
  );
}
