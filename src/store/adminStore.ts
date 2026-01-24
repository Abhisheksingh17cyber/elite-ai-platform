'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LiveMonitoringData, TestStatistics } from '@/lib/database/types';

interface AdminState {
  // Auth
  isAuthenticated: boolean;
  adminUser: { id: string; name: string; email: string; role: string } | null;
  
  // Dashboard Data
  liveMonitoringData: LiveMonitoringData[];
  statistics: TestStatistics;
  selectedSession: string | null;
  
  // Live View
  isLiveViewActive: boolean;
  liveViewSessionId: string | null;
  liveCodeContent: Record<string, string>;
  
  // Filters
  statusFilter: 'all' | 'active' | 'suspicious' | 'flagged';
  searchQuery: string;
  
  // Loading state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchMonitoringData: () => Promise<void>;
  setLiveMonitoringData: (data: LiveMonitoringData[]) => void;
  setStatistics: (stats: TestStatistics) => void;
  selectSession: (sessionId: string | null) => void;
  startLiveView: (sessionId: string) => void;
  stopLiveView: () => void;
  updateLiveCode: (files: Record<string, string>) => void;
  setStatusFilter: (filter: 'all' | 'active' | 'suspicious' | 'flagged') => void;
  setSearchQuery: (query: string) => void;
  terminateSession: (sessionId: string, reason: string) => Promise<void>;
  flagSession: (sessionId: string, reason: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // Initial State
      isAuthenticated: false,
      adminUser: null,
      liveMonitoringData: [],
      statistics: {
        total_candidates: 0,
        active_sessions: 0,
        completed_sessions: 0,
        average_score: 0,
        pass_rate: 0,
        average_completion_time: 0,
        anti_cheat_flags: 0
      },
      selectedSession: null,
      isLiveViewActive: false,
      liveViewSessionId: null,
      liveCodeContent: {},
      statusFilter: 'all',
      searchQuery: '',
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/admin/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          
          const data = await response.json();
          
          if (response.ok && data.success) {
            set({
              isAuthenticated: true,
              adminUser: {
                id: data.admin.id,
                name: data.admin.name,
                email: data.admin.email,
                role: data.admin.role
              },
              isLoading: false
            });
            return true;
          } else {
            set({ error: data.error || 'Login failed', isLoading: false });
            return false;
          }
        } catch (error) {
          set({ error: 'Network error. Please try again.', isLoading: false });
          console.error('Login error:', error);
          return false;
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          adminUser: null,
          selectedSession: null,
          isLiveViewActive: false,
          liveViewSessionId: null,
          error: null
        });
      },

      fetchMonitoringData: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/admin/monitoring');
          const data = await response.json();
          
          if (response.ok && data.success) {
            // Transform API data to LiveMonitoringData format
            const monitoringData: LiveMonitoringData[] = data.data.candidates.map((c: {
              sessionId: string;
              id: string;
              name: string;
              email: string;
              currentCode: string;
              timeRemaining: number;
              violations: number;
              scores: { security: number; architecture: number; performance: number };
            }) => ({
              session_id: c.sessionId,
              candidate_id: c.id,
              candidate_name: c.name,
              candidate_email: c.email,
              current_code: c.currentCode,
              time_remaining: c.timeRemaining,
              violation_count: c.violations,
              status: c.violations > 3 ? 'suspicious' : 'active',
              security_score: c.scores.security,
              architecture_score: c.scores.architecture,
              performance_score: c.scores.performance
            }));
            
            set({
              liveMonitoringData: monitoringData,
              statistics: {
                total_candidates: data.data.statistics.activeTests + data.data.statistics.completedToday,
                active_sessions: data.data.statistics.activeTests,
                completed_sessions: data.data.statistics.completedToday,
                average_score: data.data.statistics.averageScore,
                pass_rate: 0,
                average_completion_time: 0,
                anti_cheat_flags: data.data.statistics.criticalViolations
              },
              isLoading: false
            });
          } else {
            set({ error: data.error || 'Failed to fetch data', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Failed to fetch monitoring data', isLoading: false });
          console.error('Fetch monitoring data error:', error);
        }
      },

      setLiveMonitoringData: (data) => set({ liveMonitoringData: data }),
      
      setStatistics: (stats) => set({ statistics: stats }),
      
      selectSession: (sessionId) => set({ selectedSession: sessionId }),
      
      startLiveView: (sessionId) => set({ 
        isLiveViewActive: true, 
        liveViewSessionId: sessionId 
      }),
      
      stopLiveView: () => set({ 
        isLiveViewActive: false, 
        liveViewSessionId: null,
        liveCodeContent: {}
      }),
      
      updateLiveCode: (files) => set({ liveCodeContent: files }),
      
      setStatusFilter: (filter) => set({ statusFilter: filter }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      terminateSession: async (sessionId, reason) => {
        try {
          const response = await fetch(`/api/sessions/${sessionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'terminated' })
          });
          
          if (response.ok) {
            console.log(`Terminated session ${sessionId}: ${reason}`);
            const { liveMonitoringData } = get();
            set({
              liveMonitoringData: liveMonitoringData.filter(d => d.session_id !== sessionId)
            });
          }
        } catch (error) {
          console.error('Failed to terminate session:', error);
        }
      },
      
      flagSession: async (sessionId, reason) => {
        try {
          // Log anti-cheat event for flagging
          await fetch(`/api/sessions/${sessionId}/anticheat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventType: 'manual_flag',
              severity: 'critical',
              details: reason,
              metadata: { flaggedBy: 'admin' }
            })
          });
          
          console.log(`Flagged session ${sessionId}: ${reason}`);
          const { liveMonitoringData } = get();
          set({
            liveMonitoringData: liveMonitoringData.map(d => 
              d.session_id === sessionId 
                ? { ...d, status: 'flagged' as const }
                : d
            )
          });
        } catch (error) {
          console.error('Failed to flag session:', error);
        }
      }
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        adminUser: state.adminUser
      })
    }
  )
);

export default useAdminStore;
