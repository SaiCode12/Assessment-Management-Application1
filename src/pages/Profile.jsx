import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Camera, User, Mail, Lock, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../css/Profile.css';

const Profile = () => {
  const { user, updateUser ,updateProfile} = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();

  const [name,     setName]     = useState(user?.name || '');
  const [email,    setEmail]    = useState(user?.email || '');
  const [avatar,   setAvatar]   = useState(user?.avatar || '');
  const [pwForm,   setPwForm]   = useState({ current: '', next: '', confirm: '' });
  const [saving,   setSaving]   = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  /* ── avatar pick ── */
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2 MB'); return; }
    const reader = new FileReader();
    reader.onload = ev => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  /* ── save profile ── */
  const handleSaveProfile = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      /* Attempt backend update; fall back to local-only if no endpoint */
      try {
      await updateProfile({
      name,
      email,
    
    }); // 👈 ONLY THIS

    toast.success('Profile updated!');
      } catch {
        /* no profile endpoint – update locally */
        toast.error(err.response?.data?.message || 'Failed to update profile');
      }
      
    } finally {
      setSaving(false);
    }
  };

  /* ── change password ── */
  const handleChangePassword = async () => {
    if (!pwForm.current) { toast.error('Enter current password'); return; }
    if (pwForm.next.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (pwForm.next !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setPwSaving(true);
    try {
      await api.put('/auth/password', { currentPassword: pwForm.current, newPassword: pwForm.next });
      toast.success('Password changed!');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  const initials = name?.[0]?.toUpperCase() || '?';

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account details and photo</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={16}/> Back
        </button>
      </div>

      <div className="profile-layout">

        {/* ── LEFT: avatar card ── */}
        <div className="profile-avatar-card card">
          <div className="avatar-preview-wrap">
            <div className="avatar-preview">
              {avatar
                ? <img src={avatar} alt="avatar" className="avatar-preview-img"/>
                : <span className="avatar-preview-initials">{initials}</span>
              }
            
            </div>
            
          </div>
          <div className="avatar-card-name">{name || 'Your Name'}</div>
          <div className="avatar-card-email">{email}</div>
      
        </div>

        {/* ── RIGHT: edit forms ── */}
        <div className="profile-forms">

          {/* Personal info */}
          <div className="card profile-section">
            <div className="card-header">
              <h3 className="section-title"><User size={18}/> Personal Information</h3>
            </div>
            <div className="profile-fields-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" value={name}
                  onChange={e => setName(e.target.value)} placeholder="Your name"/>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={15} className="input-icon"/>
                  <input className="form-control with-icon" value={email}
                    onChange={e => setEmail(e.target.value)} placeholder="you@example.com" type="email"/>
                </div>
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleSaveProfile} disabled={saving}>
              {saving ? <span className="btn-spinner"/> : <Save size={15}/>}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>

          {/* Password */}
          <div className="card profile-section">
            <div className="card-header">
              <h3 className="section-title"><Lock size={18}/> Change Password</h3>
            </div>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input className="form-control" type="password" placeholder="••••••••"
                value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}/>
            </div>
            <div className="profile-fields-grid">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-control" type="password" placeholder="Min 6 characters"
                  value={pwForm.next} onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))}/>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className="form-control" type="password" placeholder="Repeat new password"
                  value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}/>
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleChangePassword} disabled={pwSaving}>
              {pwSaving ? <span className="btn-spinner"/> : <Lock size={15}/>}
              {pwSaving ? 'Changing…' : 'Change Password'}
            </button>
          </div>

          {/* Account info */}
          {/* <div className="card profile-section">
            <div className="card-header">
              <h3 className="section-title"><User size={18}/> Account Details</h3>
            </div>
            <div className="account-info-grid">
              <div className="account-info-item">
                <span className="ai-label">User ID</span>
                <span className="ai-val mono">{user?.id || user?._id || '—'}</span>
              </div>
              <div className="account-info-item">
                <span className="ai-label">Member Since</span>
                <span className="ai-val">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })
                    : '—'}
                </span>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Profile;
