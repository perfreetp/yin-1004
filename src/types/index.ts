export interface DailyStats {
  date: string
  totalVisitors: number
  currentInPark: number
  ticketRevenue: number
  complaintCount: number
  performanceCount: number
  shopOpenRate: number
}

export interface TicketSale {
  id: string
  timeSlot: string
  ticketType: string
  quantity: number
  amount: number
  date: string
}

export interface TeamReservation {
  id: string
  teamName: string
  contactPerson: string
  contactPhone: string
  visitorCount: number
  reservationDate: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
}

export interface Actor {
  id: string
  name: string
  role: string
  checkedIn: boolean
}

export interface Performance {
  id: string
  name: string
  venue: string
  startTime: string
  endTime: string
  date: string
  actors: Actor[]
  status: 'scheduled' | 'confirmed' | 'cancelled'
  cancelReason?: string
}

export interface VisitorFlowRecord {
  timeSlot: string
  inCount: number
  outCount: number
  currentCount: number
}

export interface AreaFlow {
  areaName: string
  currentCount: number
  capacity: number
  level: 'normal' | 'warning' | 'danger'
}

export interface Shop {
  id: string
  name: string
  location: string
  category: string
  isOpen: boolean
  rentExpiryDate: string
  monthlyRevenue: number
}

export interface Complaint {
  id: string
  title: string
  content: string
  type: string
  reporterName: string
  reporterPhone: string
  status: 'pending' | 'processing' | 'resolved'
  assignee?: string
  createdAt: string
  updatedAt: string
  remark?: string
}

export type PatrolEventType = 'normal' | 'crowd' | 'facility_damage' | 'child_missing' | 'lost_item' | 'other'

export interface NotificationRef {
  id: string
  title: string
  publishTime: string
}

export interface PatrolRecord {
  id: string
  staffName: string
  route: string
  startTime: string
  endTime: string
  photos: string[]
  notes: string
  eventType?: PatrolEventType
  eventLocation?: string
  eventTime?: string
  eventDescription?: string
  linkedNotifications: NotificationRef[]
  lostItems: LostItem[]
}

export interface LostItem {
  id: string
  name: string
  description: string
  location: string
  foundTime: string
  status: 'registered' | 'claimed' | 'unclaimed'
  contactInfo?: string
  storageLocation?: string
  handoverTo?: string
  handoverTime?: string
  remark?: string
}

export type NotificationSource = 'manual' | 'lost_item' | 'patrol' | 'briefing'

export interface PublishLogEntry {
  action: 'published' | 'revoked'
  time: string
  reason?: string
  targetAreas?: string[]
  source?: NotificationSource
  sourceId?: string
}

export interface AppNotification {
  id: string
  title: string
  content: string
  type: 'broadcast' | 'announcement' | 'briefing'
  targetAreas: string[]
  status: 'draft' | 'published' | 'revoked' | 'scheduled'
  publishTime?: string
  scheduledPublishTime?: string
  isPinned: boolean
  createdAt: string
  source: NotificationSource
  sourceId?: string
  publishHistory: PublishLogEntry[]
}
