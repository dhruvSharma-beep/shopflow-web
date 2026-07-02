'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Profile { name: string; email: string; phone: string; avatar: string; addresses: Address[]; }
interface Address { id: string; label: string; street: string; city: string; postcode: string; country: string; isDefault: boolean; }

export default function UserProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState('');

  useEffect(() => {
    if (session?.user) fetch('/api/user/profile').then(r => r.json()).then(d => setProfile(d.profile));
  }, [session]);

  const save = async () => {
    if (!profile) return;
    setSaving(true); setMsg('');
    const res = await fetch('/api/user/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
    const d = await res.json();
    setMsg(d.success ? 'Profile saved!' : d.error || 'Save failed');
    setSaving(false);
  };

  if (!profile) return <div className="p-8 animate-pulse"><div className="h-8 w-48 bg-gray-100 rounded mb-4" /><div className="h-64 bg-gray-100 rounded-xl" /></div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
        {['name','email','phone'].map(field => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{field}</label>
            <input value={(profile as any)[field] ?? ''} onChange={e => setProfile({ ...profile, [field]: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
          </div>
        ))}
        {msg && <p className={`text-sm ${msg.includes('saved') ? 'text-green-600' : 'text-red-500'}`}>{msg}</p>}
        <button onClick={save} disabled={saving} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-indigo-700">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}