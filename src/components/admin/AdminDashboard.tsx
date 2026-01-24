'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Activity,
  AlertTriangle,
  Clock,
  TrendingUp,
  Eye,
  Shield,
  Search,
  Filter,
  MoreVertical,
  Play,
  Ban,
  Flag,
  RefreshCw,
  Monitor,
  Code,
  CheckCircle,
  XCircle,
  Zap,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import type { LiveMonitoringData } from '@/lib/database/types';

// Mock data for demonstration
const mockLiveData: LiveMonitoringData[] = [
  {
    session_id: 'sess-001',
    candidate_name: 'Rahul Sharma',
    candidate_email: 'rahul@iitd.ac.in',
    current_file: 'main.py',
    time_remaining: 5400,
    current_score: 45,
    anti_cheat_warnings: 0,
    status: 'active',
    last_activity: new Date(),
    code_changes_count: 127
  },
  {
    session_id: 'sess-002',
    candidate_name: 'Priya Patel',
    candidate_email: 'priya@iitb.ac.in',
    current_file: 'auth_service.py',
    time_remaining: 4200,
    current_score: 62,
    anti_cheat_warnings: 1,
    status: 'active',
    last_activity: new Date(),
    code_changes_count: 203
  },
  {
    session_id: 'sess-003',
    candidate_name: 'Amit Kumar',
    candidate_email: 'amit@iitm.ac.in',
    current_file: 'vector_cache.py',
    time_remaining: 3000,
    current_score: 38,
    anti_cheat_warnings: 3,
    status: 'suspicious',
    last_activity: new Date(Date.now() - 120000),
    code_changes_count: 89
  },
  {
    session_id: 'sess-004',
    candidate_name: 'Neha Singh',
    candidate_email: 'neha@iitkgp.ac.in',
    current_file: 'security_scan.py',
    time_remaining: 6000,
    current_score: 71,
    anti_cheat_warnings: 0,
    status: 'active',
    last_activity: new Date(),
    code_changes_count: 156
  }
];

const mockStats = {
  total_candidates: 156,
  active_sessions: 4,
  completed_sessions: 142,
  average_score: 47.3,
  pass_rate: 5.2,
  average_completion_time: 98,
  anti_cheat_flags: 12
};

// StatCard Component - moved outside to prevent recreation during render
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subtext, 
  trend,
  color = 'blue'
}: { 
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down';
  color?: string;
}) {
  const colorClasses: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400' },
  };
  
  const colors = colorClasses[color] || colorClasses.blue;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#12121a] border border-[#27272a] rounded-xl p-6 hover:border-[#3f3f46] transition-all"
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-lg ${colors.bg}`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            <TrendingUp className={`w-4 h-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
            <span>{trend === 'up' ? '+2.5%' : '-1.2%'}</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const {
    isAuthenticated,
    adminUser,
    logout,
    liveMonitoringData,
    statistics,
    setLiveMonitoringData,
    setStatistics,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    startLiveView,
    terminateSession,
    flagSession
  } = useAdminStore();

  const [showActions, setShowActions] = useState<string | null>(null);

  // Load mock data
  useEffect(() => {
    // Simulate API call
    const loadData = setTimeout(() => {
      setLiveMonitoringData(mockLiveData);
      setStatistics(mockStats);
    }, 1000);

    return () => clearTimeout(loadData);

    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      setLiveMonitoringData(mockLiveData.map(d => ({
        ...d,
        time_remaining: Math.max(0, d.time_remaining - 5),
        code_changes_count: d.code_changes_count + Math.floor(Math.random() * 3)
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, [setLiveMonitoringData, setStatistics]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredData = liveMonitoringData.filter(d => {
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchesSearch = 
      d.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.candidate_email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'suspicious': return 'text-yellow-400 bg-yellow-400/10';
      case 'flagged': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-[#27272a]">
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Admin Dashboard</h1>
                <p className="text-xs text-gray-500">Elite Challenge Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 text-sm font-medium">LIVE</span>
                <span className="text-gray-400 text-sm">{statistics.active_sessions} Active</span>
              </div>

              <button className="p-2 hover:bg-[#1a1a24] rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-400" />
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-[#27272a]">
                <div className="text-right">
                  <p className="text-sm font-medium">{adminUser?.name}</p>
                  <p className="text-xs text-gray-500">{adminUser?.role}</p>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={Users} 
            label="Total Candidates" 
            value={statistics.total_candidates}
            subtext="All time registrations"
            trend="up"
            color="blue"
          />
          <StatCard 
            icon={Activity} 
            label="Active Sessions" 
            value={statistics.active_sessions}
            subtext="Currently taking test"
            color="green"
          />
          <StatCard 
            icon={BarChart3} 
            label="Pass Rate" 
            value={`${statistics.pass_rate}%`}
            subtext="Score ≥85 required"
            trend="down"
            color="purple"
          />
          <StatCard 
            icon={AlertTriangle} 
            label="Anti-Cheat Flags" 
            value={statistics.anti_cheat_flags}
            subtext="High severity violations"
            color="red"
          />
        </div>

        {/* Live Monitoring Section */}
        <div className="bg-[#12121a] border border-[#27272a] rounded-xl overflow-hidden">
          {/* Section Header */}
          <div className="px-6 py-4 border-b border-[#27272a] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-blue-400" />
              <h2 className="font-semibold text-lg">Live Monitoring</h2>
              <span className="px-2 py-1 text-xs bg-blue-500/10 text-blue-400 rounded-full">
                Real-time
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-[#1a1a24] border border-[#27272a] rounded-lg text-sm focus:outline-none focus:border-blue-500 w-64"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'suspicious' | 'flagged')}
                  className="bg-[#1a1a24] border border-[#27272a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspicious">Suspicious</option>
                  <option value="flagged">Flagged</option>
                </select>
              </div>

              {/* Refresh */}
              <button className="p-2 hover:bg-[#1a1a24] rounded-lg transition-colors">
                <RefreshCw className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1a1a24]">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Candidate</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Current File</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Time Left</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Score</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Warnings</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Activity</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((candidate) => (
                  <motion.tr
                    key={candidate.session_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-[#27272a] hover:bg-[#1a1a24]/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-linear-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {candidate.candidate_name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{candidate.candidate_name}</p>
                          <p className="text-xs text-gray-500">{candidate.candidate_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-mono">{candidate.current_file}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 ${candidate.time_remaining < 1800 ? 'text-red-400' : 'text-gray-300'}`}>
                        <Clock className="w-4 h-4" />
                        <span className="font-mono">{formatTime(candidate.time_remaining)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-[#27272a] rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              candidate.current_score >= 85 ? 'bg-green-500' :
                              candidate.current_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${candidate.current_score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{candidate.current_score}/100</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                        {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {candidate.anti_cheat_warnings > 0 ? (
                        <div className="flex items-center gap-2 text-yellow-400">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-medium">{candidate.anti_cheat_warnings}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span>Clean</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span className="text-sm">{candidate.code_changes_count} changes</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startLiveView(candidate.session_id)}
                          className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors group"
                          title="Watch Live"
                        >
                          <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setShowActions(showActions === candidate.session_id ? null : candidate.session_id)}
                            className="p-2 hover:bg-[#1a1a24] rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                          {showActions === candidate.session_id && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a24] border border-[#27272a] rounded-lg shadow-xl z-10">
                              <button
                                onClick={() => flagSession(candidate.session_id, 'Manual flag by admin')}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-[#27272a] flex items-center gap-2 text-yellow-400"
                              >
                                <Flag className="w-4 h-4" />
                                Flag Session
                              </button>
                              <button
                                onClick={() => terminateSession(candidate.session_id, 'Terminated by admin')}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-[#27272a] flex items-center gap-2 text-red-400"
                              >
                                <Ban className="w-4 h-4" />
                                Terminate
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No active sessions found</p>
              <p className="text-sm text-gray-500 mt-1">Waiting for candidates to start their tests</p>
            </div>
          )}
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-8 grid grid-cols-3 gap-6">
          <div className="bg-[#12121a] border border-[#27272a] rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Score Distribution</h3>
            <div className="space-y-3">
              {[
                { range: '85-100', count: 8, color: 'bg-green-500' },
                { range: '60-84', count: 23, color: 'bg-yellow-500' },
                { range: '40-59', count: 67, color: 'bg-orange-500' },
                { range: '0-39', count: 44, color: 'bg-red-500' },
              ].map(({ range, count, color }) => (
                <div key={range} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16">{range}</span>
                  <div className="flex-1 h-2 bg-[#27272a] rounded-full overflow-hidden">
                    <div className={`h-full ${color}`} style={{ width: `${(count / 142) * 100}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#12121a] border border-[#27272a] rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { action: 'Session started', user: 'Rahul S.', time: '2 min ago', icon: Play },
                { action: 'Test submitted', user: 'Ananya K.', time: '5 min ago', icon: CheckCircle },
                { action: 'Warning issued', user: 'Vijay P.', time: '8 min ago', icon: AlertTriangle },
                { action: 'Session ended', user: 'Meera R.', time: '12 min ago', icon: XCircle },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm">{item.action}</p>
                    <p className="text-xs text-gray-500">{item.user}</p>
                  </div>
                  <span className="text-xs text-gray-500">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#12121a] border border-[#27272a] rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-4">System Status</h3>
            <div className="space-y-3">
              {[
                { name: 'Database', status: 'Operational', healthy: true },
                { name: 'Anti-Cheat', status: 'Active', healthy: true },
                { name: 'Code Runner', status: 'Operational', healthy: true },
                { name: 'WebSocket', status: 'Connected', healthy: true },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.healthy ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={`text-xs ${item.healthy ? 'text-green-400' : 'text-red-400'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
