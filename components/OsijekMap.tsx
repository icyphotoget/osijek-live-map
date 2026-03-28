'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Search, Plus, Clock, MapPin, Music, Trophy, PartyPopper, Coffee, Palette, X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import clsx from 'clsx'

// Types
interface Event {
  id: string
  title: string
  category: 'concert' | 'quiz' | 'sport' | 'party' | 'culture' | 'coffee'
  location: [number, number]
  address: string
  time: string
  endTime: string
  image: string
  description: string
}

interface AddEventForm {
  title: string
  category: Event['category']
  address: string
  time: string
  endTime: string
  description: string
}

// Dummy data
const DUMMY_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Quiz Night @ KSET',
    category: 'quiz',
    location: [45.5511, 18.6939],
    address: 'KSET, Cara Hadrijana 6',
    time: '20:00',
    endTime: '23:00',
    image: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=400&q=80',
    description: 'Tjedni kviz općeg znanja uz odličnu atmosferu i nagrade!',
  },
  {
    id: '2',
    title: 'Tvrđa Open Air Party',
    category: 'party',
    location: [45.5569, 18.6955],
    address: 'Tvrđa, Osijek',
    time: '22:00',
    endTime: '05:00',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
    description: 'Najbolja party lokacija u gradu! Live DJ setup i vanjsko osvjetljenje.',
  },
  {
    id: '3',
    title: 'Basket: Grafičar vs Đakovo',
    category: 'sport',
    location: [45.5489, 18.6799],
    address: 'Srednjika, Osijek',
    time: '18:00',
    endTime: '20:00',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&q=80',
    description: 'Prvenstvena košarkaška utakmica. Dođi bodriti lokalne heroje!',
  },
  {
    id: '4',
    title: 'Jazz večer @ Promenada',
    category: 'coffee',
    location: [45.5550, 18.7100],
    address: 'Promenada, Šetalište Petra Preradovića',
    time: '19:00',
    endTime: '22:00',
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&q=80',
    description: 'Opuštena večer uz live jazz glazbu i odličnu kavu.',
  },
  {
    id: '5',
    title: 'Buvljak @ Jug 2',
    category: 'culture',
    location: [45.5350, 18.7200],
    address: 'Jug 2, Osijek',
    time: '08:00',
    endTime: '14:00',
    image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&q=80',
    description: 'Najveći buvljak u gradu! Antikviteti, vintage, i sve što poželite.',
  },
  {
    id: '6',
    title: 'Rock koncert @ Tvđa',
    category: 'concert',
    location: [45.5575, 18.6970],
    address: 'Tvrđa, Osijek',
    time: '21:00',
    endTime: '00:00',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80',
    description: 'Ljetni rock koncert u prekrasnom ambijentu tvrđe!',
  },
]

const CATEGORIES = [
  { id: 'all', label: 'Svi', icon: MapPin, color: 'bg-cobalt-500' },
  { id: 'concert', label: 'Koncerti', icon: Music, color: 'bg-purple-500' },
  { id: 'quiz', label: 'Kvizovi', icon: Calendar, color: 'bg-emerald-500' },
  { id: 'sport', label: 'Sport', icon: Trophy, color: 'bg-orange-500' },
  { id: 'party', label: 'Party', icon: PartyPopper, color: 'bg-pink-500' },
  { id: 'culture', label: 'Kultura', icon: Palette, color: 'bg-amber-500' },
  { id: 'coffee', label: 'Kava', icon: Coffee, color: 'bg-yellow-600' },
] as const

// Map component loaded dynamically (no SSR for leaflet)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

// Custom marker icon component
const CustomIcon = () => (
  <div className="relative">
    <div className="absolute -inset-2 rounded-full bg-cobalt-500/30 animate-ping" />
    <div className="w-8 h-8 bg-cobalt-500 rounded-full flex items-center justify-center shadow-lg shadow-cobalt-500/30">
      <div className="w-3 h-3 bg-white rounded-full" />
    </div>
  </div>
)

// Category Badge component
const CategoryBadge = ({ category }: { category: Event['category'] }) => {
  const cat = CATEGORIES.find((c) => c.id === category)
  if (!cat) return null

  return (
    <span
      className={clsx(
        'px-2 py-0.5 rounded-full text-xs font-medium text-white',
        cat.color
      )}
    >
      {cat.label}
    </span>
  )
}

// Event Card for popup
const EventCard = ({ event }: { event: Event }) => (
  <div className="w-72 overflow-hidden">
    <img
      src={event.image}
      alt={event.title}
      className="w-full h-32 object-cover rounded-lg mb-3"
    />
    <h3 className="font-bold text-lg mb-1 text-white">{event.title}</h3>
    <div className="flex items-center gap-2 mb-2">
      <CategoryBadge category={event.category} />
    </div>
    <div className="space-y-1 text-sm text-gray-300 mb-3">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-cobalt-400" />
        <span>{event.time} - {event.endTime}</span>
      </div>
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-cobalt-400" />
        <span className="truncate">{event.address}</span>
      </div>
    </div>
    <p className="text-xs text-gray-400 mb-3 line-clamp-2">{event.description}</p>
    <button className="w-full py-2 bg-cobalt-500 hover:bg-cobalt-600 text-white rounded-lg font-medium text-sm transition-colors">
      Vidi više
    </button>
  </div>
)

// Add Event Modal
const AddEventModal = ({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean
  onClose: () => void
  onAdd: (event: Event) => void
}) => {
  const [form, setForm] = useState<AddEventForm>({
    title: '',
    category: 'party',
    address: '',
    time: '',
    endTime: '',
    description: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newEvent: Event = {
      id: Date.now().toString(),
      ...form,
      location: [45.5511 + (Math.random() - 0.5) * 0.02, 18.6939 + (Math.random() - 0.5) * 0.02],
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=80',
    }
    onAdd(newEvent)
    setForm({ title: '', category: 'party', address: '', time: '', endTime: '', description: '' })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-dark-100 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-white">Dodaj događaj</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Naslov</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cobalt-500"
              placeholder="Naziv tvog događaja"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Kategorie</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as Event['category'] })}
              className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cobalt-500"
            >
              {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Adresa</label>
            <input
              type="text"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cobalt-500"
              placeholder="Lokacija događaja"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Početak</label>
              <input
                type="time"
                required
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cobalt-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Kraj</label>
              <input
                type="time"
                required
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cobalt-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Opis</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cobalt-500 resize-none"
              rows={3}
              placeholder="Opiši svoj događaj..."
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-cobalt-500 hover:bg-cobalt-600 text-white rounded-lg font-semibold transition-colors"
          >
            Objavi događaj
          </button>
        </form>
      </div>
    </div>
  )
}

// Timeline Slider Component
const TimelineSlider = ({
  currentHour,
  setCurrentHour,
}: {
  currentHour: number
  setCurrentHour: (hour: number) => void
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const currentTime = new Date()
  currentTime.setHours(currentHour, 0, 0, 0)

  const formatHour = (h: number) => {
    if (h === 0) return '00'
    if (h < 10) return `0${h}`
    return h.toString()
  }

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md glass rounded-2xl p-4 z-[400]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400">00:00</span>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cobalt-400" />
          <span className="text-sm font-medium text-white">
            {currentTime.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <span className="text-xs text-gray-400">23:59</span>
      </div>

      <div className="relative">
        <input
          type="range"
          min={0}
          max={23}
          value={currentHour}
          onChange={(e) => setCurrentHour(Number(e.target.value))}
          className="w-full h-2 bg-dark-200 rounded-full appearance-none cursor-pointer slider-thumb"
        />
        <style jsx>{`
          input[type='range']::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 20px;
            height: 20px;
            background: #3B82F6;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
          }
          input[type='range']::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: #3B82F6;
            border-radius: 50%;
            cursor: pointer;
            border: none;
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
          }
        `}</style>
      </div>

      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <button
          onClick={() => setCurrentHour(Math.max(0, currentHour - 1))}
          className="p-1 hover:text-cobalt-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span>{formatHour(currentHour)}:00</span>
        <button
          onClick={() => setCurrentHour(Math.min(23, currentHour + 1))}
          className="p-1 hover:text-cobalt-400 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Main Component
export default function OsijekLiveMap() {
  const [mounted, setMounted] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentHour, setCurrentHour] = useState(new Date().getHours())
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [events, setEvents] = useState<Event[]>(DUMMY_EVENTS)
  const [leaflet, setLeaflet] = useState<typeof import('leaflet') | null>(null)

  useEffect(() => {
    setMounted(true)
    import('leaflet').then((L) => {
      setLeaflet(L)
    })
  }, [])

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.address.toLowerCase().includes(searchQuery.toLowerCase())
      const eventHour = parseInt(event.time.split(':')[0])
      const matchesTime = eventHour <= currentHour
      return matchesCategory && matchesSearch && matchesTime
    })
  }, [events, selectedCategory, searchQuery, currentHour])

  const handleAddEvent = useCallback((event: Event) => {
    setEvents((prev) => [...prev, event])
  }, [])

  if (!mounted || !leaflet) {
    return (
      <div className="h-screen w-screen bg-dark-300 flex items-center justify-center">
        <div className="text-cobalt-400 text-lg">Učitavam mapu...</div>
      </div>
    )
  }

  const customIcon = leaflet.divIcon({
    className: 'custom-marker',
    html: '<div class="relative"><div class="absolute -inset-2 rounded-full bg-blue-500/30 animate-ping"></div><div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30"><div class="w-3 h-3 bg-white rounded-full"></div></div></div>',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Map */}
      <MapContainer
        center={[45.5511, 18.6939]}
        zoom={14}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {filteredEvents.map((event) => (
          <Marker key={event.id} position={event.location} icon={customIcon}>
            <Popup>
              <EventCard event={event} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Search Bar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[500]">
        <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pretraži događaje..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="absolute top-24 left-0 right-0 z-[500] px-4">
        <div className="category-scroll flex gap-2 overflow-x-auto py-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isActive = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-cobalt-500 text-white shadow-lg shadow-cobalt-500/30'
                    : 'glass text-gray-300 hover:bg-white/10'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Add Event FAB */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="absolute top-24 right-4 z-[500] w-14 h-14 bg-cobalt-500 hover:bg-cobalt-600 rounded-full shadow-lg shadow-cobalt-500/30 flex items-center justify-center transition-all hover:scale-110"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Timeline Slider */}
      <TimelineSlider currentHour={currentHour} setCurrentHour={setCurrentHour} />

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddEvent}
      />

      {/* Logo/Branding */}
      <div className="absolute top-6 left-4 z-[500] flex items-center gap-2">
        <div className="w-10 h-10 bg-cobalt-500 rounded-xl flex items-center justify-center shadow-lg">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-white text-lg leading-none">Osijek</h1>
          <p className="text-xs text-cobalt-400 font-medium">Live Map</p>
        </div>
      </div>

      {/* Events count indicator */}
      <div className="absolute bottom-24 left-4 z-[500] glass rounded-lg px-3 py-1.5">
        <span className="text-xs text-gray-300">
          <span className="text-cobalt-400 font-semibold">{filteredEvents.length}</span> događaja
        </span>
      </div>
    </div>
  )
}
