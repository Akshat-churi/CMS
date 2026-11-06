import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Calendar, MapPin, Clock, ArrowRight, ExternalLink, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import { ContentTypeBadge } from '../../components/common/Badge';

export const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/contents', {
        params: { type: 'event', limit: 30 }
      });
      if (res.data.success) {
        setEvents(res.data.contents);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const parseEventDate = (dateStr) => {
    if (!dateStr) return { month: 'TBA', day: '--', year: '2026' };
    const date = new Date(dateStr);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: date.toLocaleDateString('en-US', { day: '2-digit' }),
      year: date.getFullYear().toString(),
      full: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    };
  };

  const featuredEvent = events.length > 0 ? events[0] : null;
  const remainingEvents = events.length > 1 ? events.slice(1) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
      
      {/* Header Section */}
      <div className="space-y-4 max-w-4xl border-b border-slate-200 pb-8">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-fuchsia-50 border border-fuchsia-200 text-fuchsia-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-fuchsia-600" />
            Global Tech Calendar
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {events.length} Upcoming Summits & Workshops
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black text-slate-950 tracking-tight leading-[1.1]">
          Summits, Conferences & Workshops
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-light">
          Connect with systems engineers, distributed systems researchers, and editorial innovators at our flagship conferences and community workshops.
        </p>
      </div>

      {loading ? (
        <div className="space-y-8">
          <div className="h-96 bg-slate-100 rounded-3xl animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-80 bg-slate-100 rounded-3xl animate-pulse"></div>
            <div className="h-80 bg-slate-100 rounded-3xl animate-pulse"></div>
          </div>
        </div>
      ) : events.length > 0 ? (
        <div className="space-y-12">
          
          {/* Featured Top Summit */}
          {featuredEvent && (() => {
            const dateObj = parseEventDate(featuredEvent.published_at || featuredEvent.created_at);
            return (
              <div className="bg-slate-950 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl grid grid-cols-1 lg:grid-cols-12 group">
                <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto overflow-hidden bg-slate-900">
                  <img
                    src={featuredEvent.featured_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'}
                    alt={featuredEvent.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase bg-fuchsia-600 text-white shadow-lg">
                      Keynote Summit
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between space-y-6">
                  <div className="space-y-5">
                    
                    {/* Date Block & Venue */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex flex-col items-center justify-center text-center shrink-0">
                        <span className="text-[10px] font-black uppercase text-fuchsia-400 font-mono">{dateObj.month}</span>
                        <span className="text-xl font-black text-white font-serif -mt-1">{dateObj.day}</span>
                      </div>
                      <div className="text-xs space-y-0.5">
                        <p className="font-bold text-white">{dateObj.full}</p>
                        <p className="text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-fuchsia-400" />
                          <span>San Francisco / Worldwide Hybrid</span>
                        </p>
                      </div>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-serif font-black text-white group-hover:text-fuchsia-300 transition-colors leading-tight">
                      <Link to={`/content/${featuredEvent.slug}`}>
                        {featuredEvent.title}
                      </Link>
                    </h2>

                    <p className="text-sm text-slate-300 leading-relaxed font-light line-clamp-3">
                      {featuredEvent.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Registration Open</span>
                    </div>
                    <Link
                      to={`/content/${featuredEvent.slug}`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold transition-all shadow-lg shadow-fuchsia-600/30"
                    >
                      <span>Agenda & RSVP</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Remaining Events Grid */}
          {remainingEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {remainingEvents.map((ev) => {
                const dateObj = parseEventDate(ev.published_at || ev.created_at);
                return (
                  <div
                    key={ev.id}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                      <img
                        src={ev.featured_image || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80'}
                        alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-950/80 text-white border border-white/20 backdrop-blur">
                          Developer Workshop
                        </span>
                      </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-fuchsia-50 border border-fuchsia-200 flex flex-col items-center justify-center text-center shrink-0">
                            <span className="text-[10px] font-black uppercase text-fuchsia-700 font-mono">{dateObj.month}</span>
                            <span className="text-lg font-black text-slate-900 font-serif -mt-1">{dateObj.day}</span>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{dateObj.full}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              Virtual Livestream & Workshop
                            </p>
                          </div>
                        </div>

                        <h3 className="font-serif font-bold text-xl text-slate-900 group-hover:text-fuchsia-700 transition-colors leading-snug">
                          <Link to={`/content/${ev.slug}`}>{ev.title}</Link>
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {ev.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500">Free Virtual Access</span>
                        <Link
                          to={`/content/${ev.slug}`}
                          className="text-xs font-bold text-fuchsia-700 hover:text-fuchsia-900 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                        >
                          Event Details <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-3">
          <Calendar className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="text-lg font-serif font-bold text-slate-800">No scheduled events at this time</h3>
          <p className="text-xs text-slate-500">Check back next quarter for our upcoming developer summit announcements.</p>
        </div>
      )}

    </div>
  );
};

export default EventsPage;
