
'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi as viLocale, enUS } from 'date-fns/locale';
import { useLanguage } from '@/store/LanguageContext';

interface RelativeTimeProps {
  date: string;
}

export function RelativeTime({ date }: RelativeTimeProps) {
  const { locale: lang } = useLanguage();
  const [relativeTime, setRelativeTime] = useState('');

  useEffect(() => {
    const locale = lang === 'vi' ? viLocale : enUS;
    setRelativeTime(formatDistanceToNow(new Date(date), { addSuffix: true, locale }));
  }, [date, lang]);

  if (!relativeTime) {
    return null; // Render nothing on the server and initial client render
  }

  return <>{relativeTime}</>;
}
