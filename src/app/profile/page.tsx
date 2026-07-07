'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { GamePlatform, platformLabelMap } from '@/types';
import { getUserProfile, setUserProfile } from '@/lib/firebase-firestore';
import { type UserProfile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { User, Save, Bell, Gamepad2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, initialized } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [preferredPlatforms, setPreferredPlatforms] = useState<GamePlatform[]>([]);
  const [releaseReminders, setReleaseReminders] = useState(true);
  const [dealAlerts, setDealAlerts] = useState(true);

  useEffect(() => {
    if (initialized && !user) {
      router.push('/login');
    }
  }, [initialized, user, router]);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    const currentDisplayName = user.displayName;
    async function loadProfile() {
      try {
        const p = await getUserProfile(uid);
        if (p) {
          setProfile(p);
          setDisplayName(p.displayName || '');
          setPreferredPlatforms(p.preferredPlatforms || []);
          setReleaseReminders(p.notifications?.releaseReminders ?? true);
          setDealAlerts(p.notifications?.dealAlerts ?? true);
        } else {
          setDisplayName(currentDisplayName || '');
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  if (!initialized || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedProfile: UserProfile = {
        userId: user!.uid,
        displayName: displayName.trim() || undefined,
        preferredPlatforms,
        notifications: {
          releaseReminders,
          dealAlerts,
        },
      };
      await setUserProfile(user!.uid, updatedProfile);
      setProfile(updatedProfile);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handlePlatformToggle = (platform: GamePlatform) => {
    setPreferredPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <p className="text-slate-400 mt-1">Manage your account and preferences</p>
      </div>

      {/* Avatar & basic info */}
      <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <div className="p-1.5 rounded-lg stat-icon-violet">
              <User className="h-4 w-4 text-violet-400" />
            </div>
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white/[0.08]">
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-2xl font-bold">
                {user!.displayName?.[0]?.toUpperCase() || user!.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-medium">{user!.displayName || 'No display name'}</p>
              <p className="text-sm text-slate-500">{user!.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Display Name</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="border-white/[0.08] bg-white/[0.04] text-slate-100 placeholder:text-slate-500 focus:border-violet-500/40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferred Platforms */}
      <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <div className="p-1.5 rounded-lg stat-icon-green">
              <Gamepad2 className="h-4 w-4 text-emerald-400" />
            </div>
            Preferred Platforms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(platformLabelMap).map(([value, label]) => (
              <Button
                key={value}
                type="button"
                variant={preferredPlatforms.includes(value as GamePlatform) ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePlatformToggle(value as GamePlatform)}
                className={
                  preferredPlatforms.includes(value as GamePlatform)
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-violet-500/20'
                    : 'border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }
              >
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <div className="p-1.5 rounded-lg stat-icon-blue">
              <Bell className="h-4 w-4 text-cyan-400" />
            </div>
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={releaseReminders}
              onChange={(e) => setReleaseReminders(e.target.checked)}
              className="h-4 w-4 rounded border-white/[0.15] bg-white/[0.04] text-violet-500 focus:ring-violet-500/30 focus:ring-offset-0"
            />
            <div>
              <p className="text-sm text-slate-200 group-hover:text-white transition-colors">Release Reminders</p>
              <p className="text-xs text-slate-500">Get notified about upcoming game releases</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={dealAlerts}
              onChange={(e) => setDealAlerts(e.target.checked)}
              className="h-4 w-4 rounded border-white/[0.15] bg-white/[0.04] text-violet-500 focus:ring-violet-500/30 focus:ring-offset-0"
            />
            <div>
              <p className="text-sm text-slate-200 group-hover:text-white transition-colors">Deal Alerts</p>
              <p className="text-xs text-slate-500">Get notified about game deals and discounts</p>
            </div>
          </label>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-violet-500/20">
        <Save className="h-4 w-4 mr-2" />
        {saving ? 'Saving...' : 'Save Profile'}
      </Button>
    </div>
  );
}