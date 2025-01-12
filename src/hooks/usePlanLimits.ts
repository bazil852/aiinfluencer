import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface PlanLimits {
  avatars: number;
  avatarsUsed: number;
  aiCloning: number;
  aiCloningUsed: number;
  automationsEnabled: boolean;
  videoCreation: number;
  videosCreated: number;
  loading: boolean;
  error: string | null;
}

export function usePlanLimits() {
  const [limits, setLimits] = useState<PlanLimits>({
    avatars: 0,
    avatarsUsed: 0,
    aiCloning: 0,
    aiCloningUsed: 0,
    automationsEnabled: false,
    videoCreation: 0,
    videosCreated: 0,
    loading: true,
    error: null
  });
  const { currentUser } = useAuthStore();

  useEffect(() => {
    const fetchLimits = async () => {
      if (!currentUser?.email) return;

      try {
        // First get the user's current plan
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select(`
            current_plan,
            tier
          `)
          .eq('email', currentUser.email)
          .single();

          console.log("User + Plan", userData)

        if (userError) throw userError;

        if (userData?.current_plan) {
          // Get plan details
          const { data: planData, error: planError } = await supabase
            .from('plans')
            .select('avatars, ai_cloning, automations, video_creation')
            .eq('id', userData.current_plan)
            .single();
          console.log("Plans Data: ",planData);
          if (planError) throw planError;

          // Get user usage
          const { data: usageData, error: usageError } = await supabase
            .from('user_usage')
            .select('avatars_created, ai_clone_created, automation, videos_created')
            .eq('user_id', currentUser.id)
            .single();
            console.log("User Usage Data: ",usageData);

          if (usageError) throw usageError;

          if (planData && usageData) {
            // Parse the avatar limit - handle both string and JSON formats
            let avatarLimit = 0;
            try {
              // First try parsing as JSON
              const parsed = JSON.parse(planData.avatars);
              avatarLimit = parsed.limit || parseInt(parsed) || 0;
            } catch {
              // If JSON parsing fails, try direct string parsing
              avatarLimit = parseInt(planData.avatars) || 0;
            }

            // Parse Ai Cloning Limit
            let aiCloningLimit = 0;
            try {
              // First try parsing as JSON
              const parsed = JSON.parse(planData.ai_cloning);
              aiCloningLimit = parsed.limit || parseInt(parsed) || 0;
            } catch {
              // If JSON parsing fails, try direct string parsing
              aiCloningLimit = parseInt(planData.ai_cloning) || 0;
            }

            // Parse Automations Limit
            let automationsEnabled = false;
            try {
              // First try parsing as JSON
              const parsed = JSON.parse(planData.automations);
              automationsEnabled = parsed || false
            } catch {
              // If JSON parsing fails, try direct string parsing
              automationsEnabled = false;
            }

            // Parse the video creation limit
            let videoLimit = 0;
            try {
              const parsed = JSON.parse(planData.video_creation);
              console.log ("Parsed: ",parsed);
              videoLimit = parsed.limit || parseInt(parsed) || 0;
            } catch {
              videoLimit = parseInt(planData.video_creation) || 0;
            }
              console.log("Videos: ",videoLimit,"/",usageData.videos_created);
            
            setLimits({
              avatars: avatarLimit,
              avatarsUsed: usageData.avatars_created,
              aiCloning: aiCloningLimit,
              aiCloningUsed: usageData.ai_clone_created,
              automationsEnabled: automationsEnabled,
              videoCreation: videoLimit,
              videosCreated: usageData.videos_created || 0,
              loading: false,
              error: null
            });
          }
        }
      } catch (err) {
        console.error('Error fetching plan limits:', err);
        setLimits(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to fetch plan limits'
        }));
      }
    };

    fetchLimits();
  }, [currentUser?.email, currentUser?.id]);

  return limits;
}