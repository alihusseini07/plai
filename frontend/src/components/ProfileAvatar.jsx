import React from 'react';
import { getInitials } from '@/lib/account';

export default function ProfileAvatar({ user, className = 'h-10 w-10', textClassName = 'text-sm' }) {
  if (user?.avatarDataUrl) {
    return (
      <img
        src={user.avatarDataUrl}
        alt={`${user.name} profile`}
        className={`${className} rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`${className} flex items-center justify-center rounded-full bg-indigo-600 text-white ${textClassName}`}>
      {getInitials(user?.name, user?.email)}
    </div>
  );
}
