"use client"

import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './globals.css';
import Image from 'next/image';
import logo from '../images/logo.png'
import { Banner } from './components/Banner';

moment.locale('ja');
const localizer = momentLocalizer(moment);

declare global {
  interface Window {
    google: any;
  }
}

export default function Scheduler() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<{ date: string, times: string[] }[]>([]);
  const [date, setDate] = useState(new Date());
  const [userName, setUserName] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenClient, setTokenClient] = useState<any>(null);

  interface Event {
    id: string;
    title: string;
    start: Date;
    end: Date;
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleIdentityServices;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const initializeGoogleIdentityServices = () => {
    if (!window.google) {
      console.error('Google Identity Services not loaded');
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
    if (!clientId) {
      console.error('NEXT_PUBLIC_CLIENT_ID is not defined');
      return;
    }

    console.log('Initializing Google Identity Services with client ID:', clientId);

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/calendar.events',
      callback: (response: any) => {
        console.log('OAuth callback response:', response);
        if (response.error) {
          console.error('OAuth error:', response.error, response.error_description);
          alert(`ログインエラー: ${response.error}\n${response.error_description || ''}`);
          return;
        }
        console.log('Access token received successfully');
        setAccessToken(response.access_token);
        fetchUserProfile(response.access_token);
        fetchEvents(response.access_token);
      },
    });

    setTokenClient(client);
  };

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUserName(data.name);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchEvents = async (token: string) => {
    try {
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events?' +
        new URLSearchParams({
          timeMin: new Date().toISOString(),
          showDeleted: 'false',
          singleEvents: 'true',
          maxResults: '10',
          orderBy: 'startTime',
        }),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      const fetchedEvents: Event[] = data.items?.map((item: any) => ({
        id: item.id,
        title: item.summary,
        start: new Date(item.start.dateTime || item.start.date),
        end: new Date(item.end.dateTime || item.end.date),
      })) || [];
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleLogin = () => {
    console.log('Login button clicked');
    if (tokenClient) {
      console.log('Requesting access token...');
      console.log('Note: A popup window should appear. If not, check your popup blocker.');

      try {
        tokenClient.requestAccessToken({ prompt: '' });
        console.log('Access token request sent - waiting for user response...');
        console.log('If nothing happens, please check:');
        console.log('1. Popup blocker settings');
        console.log('2. Google Cloud Console - Authorized JavaScript origins');
        console.log('3. Google Cloud Console - Authorized redirect URIs');
      } catch (error) {
        console.error('Error requesting access token:', error);
        alert('ログインリクエストの送信に失敗しました。\nエラー: ' + error);
      }
    } else {
      console.error('Token client not initialized');
      alert('認証システムの初期化に失敗しました。ページを再読み込みしてください。');
    }
  };

  const handleLogout = () => {
    if (accessToken) {
      window.google?.accounts.oauth2.revoke(accessToken, () => {});
    }
    setAccessToken(null);
    setUserName(null);
    setEvents([]);
    setSelectedEvents([]);
  };

  const formatDate = (date: Date) => {
    return moment(date).format('M月D日[(]ddd[)]').replace(/Mon|Tue|Wed|Thu|Fri|Sat|Sun/g, match => {
      const map: { [key: string]: string } = { 'Mon': '月', 'Tue': '火', 'Wed': '水', 'Thu': '木', 'Fri': '金', 'Sat': '土', 'Sun': '日' };
      return map[match];
    });
  };

  const formatTime = (date: Date) => moment(date).format('HH:mm');

  const handleSelectEvent = (event: Event) => {
    const date = formatDate(event.start);
    const time = `${formatTime(event.start)}-${formatTime(event.end)}`;
    updateSelectedEvents(date, time);
  };

  const handleSelectSlot = ({ start, end }: { start: Date, end: Date }) => {
    const date = formatDate(start);
    const time = `${formatTime(start)}-${formatTime(end)}`;
    updateSelectedEvents(date, time);
  };

  const updateSelectedEvents = (date: string, time: string) => {
    const existingDate = selectedEvents.find(event => event.date === date);
    if (existingDate) {
      existingDate.times.push(time);
      setSelectedEvents([...selectedEvents]);
    } else {
      setSelectedEvents([...selectedEvents, { date, times: [time] }]);
    }
  };

  const clearSelectedEvents = () => setSelectedEvents([]);

  const copyToClipboard = () => {
    const formattedText = selectedEvents.map(event => `${event.date} ${event.times.join(', ')}`).join('\n');
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(formattedText).then(() => {
        alert('スケジュールをクリップボードにコピーしました！');
      }).catch(err => console.error('Failed to copy:', err));
    }
  };

  const eventStyleGetter = (event: Event, start: Date, end: Date) => {
    const selected = selectedEvents.some(selectedEvent =>
      selectedEvent.date === formatDate(start) && selectedEvent.times.includes(`${formatTime(start)}-${formatTime(end)}`)
    );
    return {
      style: {
        backgroundColor: selected ? '#94a3b8' : '#667eea',
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block'
      }
    };
  };

  return (
    <div>
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <div className="logo-container">
              <Image src={logo} alt="Logo" width={60} height={60} style={{objectFit: 'cover'}} />
            </div>
            <div className="title-container">
              <h1>日程げろりん</h1>
              <p>Calendar Schedule Manager</p>
            </div>
          </div>

          <div className="header-right">
            {userName && (
              <div style={{
                fontSize: '14px',
                color: '#333',
                marginRight: '12px',
                fontWeight: '600'
              }}>
                {userName}
              </div>
            )}
            {!userName ? (
              <button onClick={handleLogin} className="btn btn-primary">
                ログイン
              </button>
            ) : (
              <button onClick={handleLogout} className="btn btn-danger">
                ログアウト
              </button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <div className="main-layout">
          {/* Calendar Card */}
          <div className="card">
            <h3 className="card-title" style={{marginBottom: '12px'}}>週間カレンダー</h3>
            <div className="calendar-container">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                views={['week']}
                defaultView='week'
                timeslots={2}
                step={30}
                showMultiDayTimes
                min={new Date(0, 0, 0, 7, 0)}
                max={new Date(0, 0, 0, 23, 0)}
                eventPropGetter={eventStyleGetter}
                date={date}
                onNavigate={setDate}
                formats={{
                  dayRangeHeaderFormat: (range) => `${moment(range.start).format('M月D日')}~${moment(range.end).format('M月D日')}`
                }}
                style={{ height: '420px', width: '100%' }}
              />
            </div>
          </div>

          {/* Selected Events Card */}
          <div className="card">
            <h3 className="card-title" style={{marginBottom: '12px'}}>選択した日程</h3>

            <textarea
              value={selectedEvents.map(event => `${event.date} ${event.times.join(', ')}`).join('\n')}
              readOnly
              placeholder="カレンダーから日程を選択してください"
              className="schedule-textarea"
            />

            <div className="button-group">
              <button
                onClick={copyToClipboard}
                disabled={selectedEvents.length === 0}
                className="btn btn-primary"
                style={{flex: 1}}
              >
                📋 コピー
              </button>
              <button
                onClick={clearSelectedEvents}
                disabled={selectedEvents.length === 0}
                className="btn btn-danger"
                style={{flex: 1}}
              >
                🗑️ クリア
              </button>
            </div>
          </div>
        </div>

        {/* Banner */}
        <Banner />

        {/* Footer */}
        <footer className="footer">
          <p>© 2026 日程げろりん - Calendar Schedule Manager</p>
        </footer>
      </div>
    </div>
  );
}
