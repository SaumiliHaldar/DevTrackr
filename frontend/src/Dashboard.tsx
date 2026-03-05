import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import DashboardLayout from './DashboardLayout';
import Overview from './Overview';
import Repositories from './Repositories';
import Analytics from './Analytics';

const API_BASE = 'http://localhost:8000';

interface UserStats {
  total_commits: number;
  total_repos: number;
  total_prs: number;
  merged_prs: number;
  pr_merge_rate: number;
  languages: Record<string, number>;
  productivity_score?: number;
}

const DEFAULT_STATS: UserStats = {
  total_commits: 0,
  total_repos: 0,
  total_prs: 0,
  merged_prs: 0,
  pr_merge_rate: 0,
  languages: {},
  productivity_score: 0,
};

const Dashboard: React.FC = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const location = useLocation();

  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [repos, setRepos] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<number[]>([]);
  const [insight, setInsight] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const hasSyncedRef = useRef(false);

  // Fetch all dashboard data in parallel, with independent error handling per call
  const fetchAllData = useCallback(async (userId: string) => {
    const results = await Promise.allSettled([
      fetch(`${API_BASE}/stats/${userId}`).then(r => r.ok ? r.json() : Promise.reject(`stats ${r.status}`)),
      fetch(`${API_BASE}/repos?clerk_user_id=${userId}`).then(r => r.ok ? r.json() : Promise.reject(`repos ${r.status}`)),
      fetch(`${API_BASE}/activity/${userId}`).then(r => r.ok ? r.json() : Promise.reject(`activity ${r.status}`)),
      fetch(`${API_BASE}/insight/${userId}`).then(r => r.ok ? r.json() : Promise.reject(`insight ${r.status}`)),
    ]);

    const [statsResult, reposResult, activityResult, insightResult] = results;

    if (statsResult.status === 'fulfilled') {
      setStats({ ...DEFAULT_STATS, ...statsResult.value });
    } else {
      console.warn('[DevTrackr] Stats fetch failed:', statsResult.reason);
    }

    if (reposResult.status === 'fulfilled') {
      const reposData = reposResult.value;
      // Backend returns raw JSON (from Prisma JSON field) — ensure it's an array
      setRepos(Array.isArray(reposData) ? reposData : []);
    } else {
      console.warn('[DevTrackr] Repos fetch failed:', reposResult.reason);
    }

    if (activityResult.status === 'fulfilled') {
      const actData = activityResult.value;
      setActivityData(Array.isArray(actData) ? actData : []);
    } else {
      console.warn('[DevTrackr] Activity fetch failed:', activityResult.reason);
    }

    if (insightResult.status === 'fulfilled') {
      const insightVal = insightResult.value?.insight;
      if (insightVal) setInsight(insightVal);
    } else {
      console.warn('[DevTrackr] Insight fetch failed:', insightResult.reason);
    }
  }, []);

  // Sync user to DB on first load, then fetch all data
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    if (hasSyncedRef.current) return;
    hasSyncedRef.current = true;

    const init = async () => {
      setIsLoading(true);
      try {
        await fetch(`${API_BASE}/sync-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress ?? '',
            name: user.fullName,
            avatarUrl: user.imageUrl,
          }),
        });
      } catch (e) {
        console.warn('[DevTrackr] sync-user failed:', e);
      }
      await fetchAllData(user.id);
      setIsLoading(false);
    };

    init();
  }, [isLoaded, isSignedIn, user, fetchAllData]);

  // GitHub sync — fetches fresh data afterward
  const handleSync = async () => {
    if (!user?.id) return;
    setIsSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/sync-github?clerk_user_id=${user.id}`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('[DevTrackr] sync-github failed:', res.status, err);
      }
    } catch (e) {
      console.error('[DevTrackr] sync-github network error:', e);
    } finally {
      // Always re-fetch whether sync succeeded or not
      if (user?.id) await fetchAllData(user.id);
      setIsSyncing(false);
    }
  };

  // AI Insight generation
  const handleGenerateInsight = useCallback(async (force = false) => {
    if (!user?.id || isGeneratingInsight) return;
    setIsGeneratingInsight(true);
    try {
      const url = `${API_BASE}/generate-insight?clerk_user_id=${user.id}${force ? '&force_refresh=true' : ''}`;
      const res = await fetch(url, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.insight) setInsight(data.insight);
      } else {
        console.warn('[DevTrackr] generate-insight failed:', res.status);
      }
    } catch (e) {
      console.error('[DevTrackr] generate-insight network error:', e);
    } finally {
      setIsGeneratingInsight(false);
    }
  }, [user?.id, isGeneratingInsight]);

  return (
    <DashboardLayout>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, scale: 0.998, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.002, y: -4 }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          className="w-full h-full"
        >
          <Routes location={location} key={location.pathname}>
            <Route
              index
              element={
                <Overview
                  stats={stats}
                  repos={repos.slice(0, 5)}
                  isSyncing={isSyncing}
                  isLoading={isLoading}
                  onSync={handleSync}
                />
              }
            />
            <Route
              path="repositories"
              element={<Repositories repos={repos} isLoading={isLoading} />}
            />
            <Route
              path="analytics"
              element={
                <Analytics
                  activityData={activityData}
                  insight={insight}
                  isGeneratingInsight={isGeneratingInsight}
                  onGenerateInsight={handleGenerateInsight}
                  stats={stats}
                  isLoading={isLoading}
                />
              }
            />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Dashboard;
