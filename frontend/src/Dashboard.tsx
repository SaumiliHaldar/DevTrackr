import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import DashboardLayout from './DashboardLayout';
import Overview from './Overview';
import Repositories from './Repositories';
import Analytics from './Analytics';

interface UserStats {
  total_commits: number;
  total_repos: number;
  total_prs: number;
}

const Dashboard: React.FC = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const location = useLocation();
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState<UserStats>({ total_commits: 0, total_repos: 0, total_prs: 0 });
  const [repos, setRepos] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<number[]>([]);
  const [insight, setInsight] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);

  const fetchStats = async () => {
    if (user?.id) {
      try {
        const statsRes = await fetch(`http://localhost:8000/stats/${user.id}`);
        const statsData = await statsRes.json();
        setStats(statsData);

        const activityRes = await fetch(`http://localhost:8000/activity/${user.id}`);
        const activityData = await activityRes.json();
        setActivityData(activityData);

        const reposRes = await fetch(`http://localhost:8000/repos?clerk_user_id=${user.id}`);
        const reposData = await reposRes.json();
        setRepos(reposData);

        const insightRes = await fetch(`http://localhost:8000/insight/${user.id}`);
        if (insightRes.ok) {
           const insightData = await insightRes.json();
           setInsight(insightData.insight);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    }
  };

  const hasSyncedRef = React.useRef(false);

  useEffect(() => {
    const syncUser = async () => {
      if (!hasSyncedRef.current && isLoaded && isSignedIn && user) {
        hasSyncedRef.current = true;
        try {
          await fetch('http://localhost:8000/sync-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clerkId: user.id,
              email: user.primaryEmailAddress?.emailAddress,
              name: user.fullName,
              avatarUrl: user.imageUrl,
            }),
          });
          fetchStats();
        } catch (error) {
          console.error('Error syncing user:', error);
        }
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, user]);

  const handleSync = async () => {
    if (!user?.id) return;
    setIsSyncing(true);
    try {
      const response = await fetch(`http://localhost:8000/sync-github?clerk_user_id=${user.id}`, {
        method: 'POST',
      });
      if (response.ok) {
        await fetchStats();
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGenerateInsight = async () => {
    if (!user?.id) return;
    setIsGeneratingInsight(true);
     try {
       const response = await fetch(`http://localhost:8000/generate-insight?clerk_user_id=${user.id}`, {
         method: 'POST',
       });
       if (response.ok) {
         const data = await response.json();
         setInsight(data.insight);
       }
     } catch (error) {
       console.error('Insight generation failed:', error);
     } finally {
       setIsGeneratingInsight(false);
     }
  };

  return (
    <DashboardLayout>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, scale: 0.995, y: 3 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.005, y: -3 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="w-full h-full"
        >
          <Routes location={location} key={location.pathname}>
            <Route index element={<Overview stats={stats} repos={repos.slice(0, 5)} isSyncing={isSyncing} onSync={handleSync} />} />
            <Route path="repositories" element={<Repositories repos={repos} />} />
            <Route path="analytics" element={<Analytics activityData={activityData} insight={insight} isGeneratingInsight={isGeneratingInsight} onGenerateInsight={handleGenerateInsight} />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Dashboard;
