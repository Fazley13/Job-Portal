import React, { useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui';

interface ProfilePictureUploadProps {
  currentAvatar?: string;
  onAvatarUpdated: (avatarUrl: string) => void;
}

const VALID_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ currentAvatar, onAvatarUpdated }) => {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const name = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!VALID_TYPES.includes(file.type)) return toast.error('Use a JPG, PNG, GIF or WEBP image');
    if (file.size > 2 * 1024 * 1024) return toast.error('Image must be smaller than 2 MB');

    const formData = new FormData();
    formData.append('avatar', file);
    try {
      setBusy(true);
      const res = await axios.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      onAvatarUpdated(res.data.avatarUrl);
      toast.success('Profile picture updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not upload the picture');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    if (!currentAvatar || !window.confirm('Remove your profile picture?')) return;
    try {
      setBusy(true);
      await axios.delete('/users/avatar');
      onAvatarUpdated('');
      toast.success('Profile picture removed');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not remove the picture');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <Avatar name={name} src={currentAvatar} size="xl" className="!h-28 !w-28" />
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="btn-secondary !px-3 !py-1.5 disabled:opacity-50">
          <Camera className="h-4 w-4" /> {currentAvatar ? 'Change' : 'Upload'}
        </button>
        {currentAvatar && (
          <button type="button" disabled={busy} onClick={handleRemove} className="btn-secondary !px-3 !py-1.5 text-rose-600 disabled:opacity-50" aria-label="Remove picture">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept={VALID_TYPES.join(',')} onChange={handleFileChange} className="hidden" />
      <p className="text-xs text-gray-400">JPG, PNG, GIF or WEBP, up to 2 MB</p>
    </div>
  );
};

export default ProfilePictureUpload;
