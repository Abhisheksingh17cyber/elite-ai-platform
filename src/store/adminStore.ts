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
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
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

// Mock admin credentials (in production, use proper auth)
const ADMIN_CREDENTIALS = {
  email: 'admin@elitechallenge.com',
  password: 'admin123'
};

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

      // Actions
      login: async (email: string, password: string) => {
        // In production, validate against database
        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
          set({
            isAuthenticated: true,
            adminUser: {
              id: 'admin-1',
              name: 'Administrator',
              email: email,
              role: 'super_admin'
            }
          });
          return true;
        }
        return false;
      },

      logout: () => {
        set({
          isAuthenticated: false,
          adminUser: null,
          selectedSession: null,
          isLiveViewActive: false,
          liveViewSessionId: null
        });
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
        // In production, call API to terminate session
        console.log(`Terminating session ${sessionId}: ${reason}`);
        const { liveMonitoringData } = get();
        set({
          liveMonitoringData: liveMonitoringData.filter(d => d.session_id !== sessionId)
        });
      },
      
      flagSession: async (sessionId, reason) => {
        // In production, call API to flag session
        console.log(`Flagging session ${sessionId}: ${reason}`);
        const { liveMonitoringData } = get();
        set({
          liveMonitoringData: liveMonitoringData.map(d => 
            d.session_id === sessionId 
              ? { ...d, status: 'flagged' as const }
              : d
          )
        });
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
