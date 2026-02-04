'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Activity, AlertTriangle, Clock, TrendingUp, Eye,
  Shield, Search, Filter, MoreVertical, Ban, Flag,
  RefreshCw, ChevronRight, Terminal, Lock, Cpu, Server,
  LogOut, CheckCircle, XCircle, Grid, Zap, Monitor, Database
} from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import type { LiveMonitoringData } from '@/lib/database/types';
import LiveCodeViewer from './LiveCodeViewer';

// --- Premium UI Components ---

const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-[#0d0d10]/80 backdrop-blur-xl border border-white/5 shadow-2xl rounded-xl ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'neutral' }: { children: React.ReactNode; variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' }) => {
  const styles = {
    neutral: 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50',
    success: 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50',
    warning: 'bg-amber-950/30 text-amber-400 border-amber-900/50',
    danger: 'bg-rose-950/30 text-rose-400 border-rose-900/50',
    info: 'bg-blue-950/30 text-blue-400 border-blue-900/50',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border ${styles[variant]}`}>
      {children}
    </span>
  );
};

// Target Icon (Custom SVG to avoid missing lucide icon)
const Target = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
);

const HUDStat = ({ label, value, icon: Icon, trend }: { label: string; value: string | number; icon: any; trend?: 'up' | 'down' }) => (
  <div className="relative group p-5 bg-[#0d0d10] border border-white/5 hover:border-blue-500/20 transition-all duration-300 rounded-lg overflow-hidden">
    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon className="w-16 h-16 text-blue-500" />
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">{label}</span>
      </div>
      <div className="text-3xl font-bold text-zinc-100 font-mono tracking-tight">{value}</div>
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
          <TrendingUp className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
          <span>{trend === 'up' ? '+12%' : '-5%'}</span>
          <span className="text-zinc-600 ml-1">vs last hr</span>
        </div>
      )}
    </div>
    {/* Corner Accent */}
    <div className="absolute bottom-0 left-0 w-8 h-[2px] bg-blue-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="absolute bottom-0 left-0 h-8 w-[2px] bg-blue-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>
);

// --- Main Dashboard ---

export default function AdminDashboard() {
  const {
    isAuthenticated,
    adminUser,
    logout,
    liveMonitoringData = [],
    statistics,
    setLiveMonitoringData,
    setStatistics,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    startLiveView,
    stopLiveView,
    isLiveViewActive,
    liveViewSessionId,
    terminateSession,
    flagSession
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<'monitoring' | 'solutions'>('monitoring');
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [showActions, setShowActions] = useState<string | null>(null);

  // Mock Data & Fetch Logic preserved from original
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsDataLoading(true);
        const response = await fetch('/api/admin/monitoring');
        const data = await response.json();
        if (data.success) {
          const monitoringData: LiveMonitoringData[] = data.data.candidates.map((c: any) => ({
            session_id: c.sessionId,
            candidate_name: c.name,
            candidate_email: c.email,
            current_file: 'main.py',
            time_remaining: c.timeRemaining,
            current_score: Math.round((c.scores.security + c.scores.architecture + c.scores.performance) / 3),
            anti_cheat_warnings: c.violations,
            status: c.violations > 3 ? 'suspicious' : 'active',
            last_activity: new Date(),
            code_changes_count: 0
          }));
          setLiveMonitoringData(monitoringData);
          setStatistics({
            total_candidates: data.data.statistics.activeTests + data.data.statistics.completedToday,
            active_sessions: data.data.statistics.activeTests,
            completed_sessions: data.data.statistics.completedToday,
            average_score: data.data.statistics.averageScore,
            pass_rate: 0,
            average_completion_time: 0,
            anti_cheat_flags: data.data.statistics.criticalViolations
          });
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [setLiveMonitoringData, setStatistics]);

  const handleFlagSession = async (sessionId: string) => {
    if (confirm('Flag this session as suspicious?')) await flagSession(sessionId, 'Admin Flag');
  };

  const handleTerminateSession = async (sessionId: string) => {
    const reason = prompt('Reason for termination:');
    if (reason) await terminateSession(sessionId, reason);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredData = liveMonitoringData.filter(d => {
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchesSearch = d.candidate_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-300 font-sans selection:bg-blue-500/30">

      {/* Top Navigation Bar */}
      <nav className="h-16 border-b border-white/5 bg-[#0d0d10]/50 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-100 tracking-wide">ELITE<span className="text-blue-500">ADMIN</span></h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">System Operational</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right mr-4">
            <p className="text-xs font-medium text-zinc-200">{adminUser?.name || 'Commander'}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{adminUser?.role || 'Super Admin'}</p>
          </div>
          <button onClick={logout} className="flex items-center gap-2 px-3 py-1.5 rounded border border-white/5 hover:bg-white/5 hover:text-white transition-colors text-xs text-zinc-400">
            <LogOut className="w-3 h-3" />
            LOGOUT
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="p-6 max-w-7xl mx-auto space-y-8">

        {/* Statistics HUD */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <HUDStat label="Active Sessions" value={statistics.active_sessions} icon={Activity} trend="up" />
          <HUDStat label="Total Candidates" value={statistics.total_candidates} icon={Users} />
          <HUDStat label="Avg. Score" value={`${Math.round(statistics.average_score)}%`} icon={Target} />
          <HUDStat label="Security Flags" value={statistics.anti_cheat_flags} icon={AlertTriangle} trend={statistics.anti_cheat_flags > 0 ? "up" : undefined} />
        </div>

        {/* Control Interface */}
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex border-b border-white/5">
            {[
              { id: 'monitoring', label: 'Live Operations', icon: Monitor },
              { id: 'solutions', label: 'Reference Data', icon: Database }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'monitoring' && (
            <GlassCard className="min-h-[500px]">
              {/* Toolbar */}
              <div className="p-4 border-b border-white/5 flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="text"
                      placeholder="SEARCH CANDIDATE ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#050507] border border-white/5 rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div className="flex gap-1.5 p-1 bg-[#050507] rounded-lg border border-white/5">
                    {['all', 'active', 'suspicious', 'flagged'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setStatusFilter(filter as any)}
                        className={`px-3 py-1 rounded text-[10px] font-medium uppercase transition-all ${statusFilter === filter
                            ? 'bg-zinc-800 text-zinc-100 shadow'
                            : 'text-zinc-600 hover:text-zinc-400'
                          }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => { }}
                  className="p-2 text-zinc-500 hover:text-blue-400 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Data Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0f0f13] text-zinc-500 text-[10px] uppercase tracking-wider font-semibold border-b border-white/5">
                      <th className="px-6 py-4">Candidate</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Metrics</th>
                      <th className="px-6 py-4">Integrity</th>
                      <th className="px-6 py-4 text-right">Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence>
                      {filteredData.map((session) => (
                        <motion.tr
                          key={session.session_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center font-mono text-xs text-zinc-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                                {session.candidate_name.charAt(0)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-zinc-200">{session.candidate_name}</div>
                                <div className="text-[10px] text-zinc-600 font-mono">{session.candidate_email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={
                              session.status === 'active' ? 'success' :
                                session.status === 'suspicious' ? 'warning' : 'danger'
                            }>
                              {session.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] text-zinc-500">
                                <span>SCORE</span>
                                <span className="font-mono text-zinc-300">{session.current_score}%</span>
                              </div>
                              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden w-24">
                                <div
                                  className="h-full bg-blue-500"
                                  style={{ width: `${session.current_score}%` }}
                                />
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-zinc-500 pt-1">
                                <Clock className="w-3 h-3" />
                                <span className="font-mono">{formatTime(session.time_remaining)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {session.anti_cheat_warnings > 0 ? (
                              <div className="flex items-center gap-2 text-rose-400">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-xs font-medium">{session.anti_cheat_warnings} FLAGS</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-zinc-600">
                                <Shield className="w-4 h-4" />
                                <span className="text-xs">SECURE</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => startLiveView(session.session_id)}
                                className="p-2 hover:bg-blue-500/20 rounded text-zinc-400 hover:text-blue-400 transition-colors"
                                title="View Live"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <div className="relative">
                                <button
                                  onClick={() => setShowActions(showActions === session.session_id ? null : session.session_id)}
                                  className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                                {showActions === session.session_id && (
                                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#18181b] border border-white/10 rounded shadow-xl z-50 py-1">
                                    <button
                                      onClick={() => handleFlagSession(session.session_id)}
                                      className="w-full px-4 py-2 text-left text-xs hover:bg-white/5 flex items-center gap-2 text-amber-500"
                                    >
                                      <Flag className="w-3 h-3" /> FLAG SESSION
                                    </button>
                                    <button
                                      onClick={() => handleTerminateSession(session.session_id)}
                                      className="w-full px-4 py-2 text-left text-xs hover:bg-white/5 flex items-center gap-2 text-rose-500"
                                    >
                                      <Ban className="w-3 h-3" /> TERMINATE
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
                {filteredData.length === 0 && (
                  <div className="p-12 text-center text-zinc-600">
                    <Terminal className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-sm">NO ACTIVE SIGNALS DETECTED</p>
                  </div>
                )}
              </div>
            </GlassCard>
          )}

          {activeTab === 'solutions' && (
            <div className="space-y-4">
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500/10 rounded-lg">
                      <Shield className="w-6 h-6 text-rose-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-100">Distributed AI System</h3>
                      <div className="flex gap-2 text-[10px] mt-1">
                        <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-400 rounded border border-rose-500/30 uppercase">Extreme Difficulty</span>
                        <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30 uppercase">System Design</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a0c] rounded border border-white/5 p-4 font-mono text-xs overflow-x-auto text-emerald-400">
                  <pre>{`class DistributedSystem:
    def __init__(self):
        # Multi-region architecture with active-active replication
        self.regions = ['us-east', 'eu-west', 'ap-south']
        self.cache = VectorDatabase(consistency='eventual')
    
    def route_request(self, req):
        if self.detect_anomaly(req):
            raise SecurityViolation("Anomalous pattern detected")
        return self.load_balancer.dispatch(req)`}</pre>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Security Validation</h4>
                    <ul className="space-y-2 text-xs text-zinc-300">
                      <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-500" /> Prompt Injection Detection</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-500" /> Vector Embeddings Cache</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Red Flags</h4>
                    <ul className="space-y-2 text-xs text-zinc-300">
                      <li className="flex items-center gap-2"><AlertTriangle className="w-3 h-3 text-amber-500" /> Hardcoded API Keys</li>
                      <li className="flex items-center gap-2"><AlertTriangle className="w-3 h-3 text-amber-500" /> Single Region Dependency</li>
                    </ul>
                  </div>
                </div>
              </GlassCard>

              {/* Second Problem Placeholder */}
              <GlassCard className="p-6 opacity-50 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <Activity className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-100">Real-time Data Pipeline</h3>
                    <p className="text-xs text-zinc-500">Coming Soon</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      </main>

      {/* Live View Overlay */}
      <AnimatePresence>
        {isLiveViewActive && liveViewSessionId && (
          <LiveCodeViewer
            candidateName={liveMonitoringData.find(d => d.session_id === liveViewSessionId)?.candidate_name || 'Unknown Target'}
            sessionId={liveViewSessionId}
            candidateId={liveViewSessionId}
            onClose={stopLiveView}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
