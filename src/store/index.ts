import { create } from 'zustand'
import type {
  DailyStats,
  TicketSale,
  TeamReservation,
  Performance,
  VisitorFlowRecord,
  AreaFlow,
  Shop,
  Complaint,
  PatrolRecord,
  AppNotification,
  LostItem,
} from '@/types'

const today = new Date().toISOString().split('T')[0]
const STORAGE_KEY = 'wansui_mountain_store_v1'

const generateHourlyFlow = (): VisitorFlowRecord[] => {
  const hours = []
  const baseFlow = [0, 0, 0, 0, 0, 0, 12, 45, 120, 230, 310, 280, 190, 160, 200, 250, 220, 150, 80, 30, 5, 0, 0, 0]
  let cumulative = 0
  for (let i = 0; i < 24; i++) {
    const inCount = baseFlow[i] + Math.floor(Math.random() * 30)
    const outCount = i > 12 ? Math.floor(inCount * 0.6 + Math.random() * 20) : Math.floor(inCount * 0.1)
    cumulative += inCount - outCount
    hours.push({
      timeSlot: `${String(i).padStart(2, '0')}:00`,
      inCount,
      outCount,
      currentCount: Math.max(0, cumulative),
    })
  }
  return hours
}

const mockTicketSales: TicketSale[] = [
  { id: '1', timeSlot: '08:00-10:00', ticketType: '成人票', quantity: 342, amount: 34200, date: today },
  { id: '2', timeSlot: '08:00-10:00', ticketType: '儿童票', quantity: 128, amount: 6400, date: today },
  { id: '3', timeSlot: '08:00-10:00', ticketType: '老年票', quantity: 56, amount: 1680, date: today },
  { id: '4', timeSlot: '10:00-12:00', ticketType: '成人票', quantity: 518, amount: 51800, date: today },
  { id: '5', timeSlot: '10:00-12:00', ticketType: '儿童票', quantity: 203, amount: 10150, date: today },
  { id: '6', timeSlot: '10:00-12:00', ticketType: '老年票', quantity: 87, amount: 2610, date: today },
  { id: '7', timeSlot: '10:00-12:00', ticketType: '团队票', quantity: 160, amount: 11200, date: today },
  { id: '8', timeSlot: '12:00-14:00', ticketType: '成人票', quantity: 290, amount: 29000, date: today },
  { id: '9', timeSlot: '12:00-14:00', ticketType: '儿童票', quantity: 95, amount: 4750, date: today },
  { id: '10', timeSlot: '12:00-14:00', ticketType: '老年票', quantity: 42, amount: 1260, date: today },
  { id: '11', timeSlot: '14:00-16:00', ticketType: '成人票', quantity: 380, amount: 38000, date: today },
  { id: '12', timeSlot: '14:00-16:00', ticketType: '儿童票', quantity: 145, amount: 7250, date: today },
  { id: '13', timeSlot: '16:00-18:00', ticketType: '成人票', quantity: 210, amount: 21000, date: today },
  { id: '14', timeSlot: '16:00-18:00', ticketType: '儿童票', quantity: 68, amount: 3400, date: today },
]

const mockTeamReservations: TeamReservation[] = [
  { id: '1', teamName: '开封阳光旅行社', contactPerson: '张经理', contactPhone: '13800001111', visitorCount: 45, reservationDate: today, status: 'confirmed', createdAt: `${today} 08:30` },
  { id: '2', teamName: '郑州欢乐行旅游团', contactPerson: '李女士', contactPhone: '13900002222', visitorCount: 32, reservationDate: today, status: 'confirmed', createdAt: `${today} 09:15` },
  { id: '3', teamName: '商丘亲子游俱乐部', contactPerson: '王先生', contactPhone: '13700003333', visitorCount: 28, reservationDate: today, status: 'pending', createdAt: `${today} 10:00` },
  { id: '4', teamName: '洛阳文化体验团', contactPerson: '赵女士', contactPhone: '13600004444', visitorCount: 55, reservationDate: today, status: 'pending', createdAt: `${today} 10:45` },
  { id: '5', teamName: '许昌夕阳红旅游社', contactPerson: '孙先生', contactPhone: '13500005555', visitorCount: 38, reservationDate: today, status: 'cancelled', createdAt: `${today} 07:20` },
]

const mockPerformances: Performance[] = [
  { id: '1', name: '水浒英雄传', venue: '万岁山主舞台', startTime: '09:30', endTime: '10:15', date: today, actors: [{ id: 'a1', name: '刘建军', role: '宋江', checkedIn: true }, { id: 'a2', name: '赵志远', role: '武松', checkedIn: true }, { id: 'a3', name: '王大鹏', role: '鲁智深', checkedIn: true }], status: 'confirmed' },
  { id: '2', name: '杨家将', venue: '北广场戏台', startTime: '10:30', endTime: '11:15', date: today, actors: [{ id: 'a4', name: '陈国栋', role: '杨六郎', checkedIn: true }, { id: 'a5', name: '马飞龙', role: '杨宗保', checkedIn: false }], status: 'scheduled' },
  { id: '3', name: '包公断案', venue: '开封府实景', startTime: '11:30', endTime: '12:15', date: today, actors: [{ id: 'a6', name: '孙明辉', role: '包拯', checkedIn: true }, { id: 'a7', name: '周文博', role: '公孙策', checkedIn: true }], status: 'confirmed' },
  { id: '4', name: '岳飞传', venue: '万岁山主舞台', startTime: '14:00', endTime: '14:45', date: today, actors: [{ id: 'a8', name: '吴天昊', role: '岳飞', checkedIn: false }, { id: 'a9', name: '郑凯文', role: '岳云', checkedIn: false }], status: 'scheduled' },
  { id: '5', name: '大宋婚礼秀', venue: '民俗街区', startTime: '15:00', endTime: '15:40', date: today, actors: [{ id: 'a10', name: '林婉清', role: '新娘', checkedIn: false }, { id: 'a11', name: '张子豪', role: '新郎', checkedIn: false }], status: 'scheduled' },
  { id: '6', name: '少林功夫表演', venue: '武术馆', startTime: '16:00', endTime: '16:30', date: today, actors: [{ id: 'a12', name: '释永信', role: '主演', checkedIn: false }], status: 'scheduled' },
  { id: '7', name: '喷火杂技', venue: '南门广场', startTime: '13:00', endTime: '13:30', date: today, actors: [{ id: 'a13', name: '黄飞鸿', role: '主演', checkedIn: true }], status: 'cancelled', cancelReason: '演员身体不适' },
  { id: '8', name: '宋代舞蹈', venue: '湖心亭', startTime: '17:00', endTime: '17:30', date: today, actors: [{ id: 'a14', name: '李婉儿', role: '领舞', checkedIn: false }], status: 'scheduled' },
]

const mockVisitorFlow: VisitorFlowRecord[] = generateHourlyFlow()

const mockAreaFlows: AreaFlow[] = [
  { areaName: '万岁山主舞台', currentCount: 520, capacity: 800, level: 'normal' },
  { areaName: '开封府实景', currentCount: 380, capacity: 400, level: 'warning' },
  { areaName: '民俗街区', currentCount: 290, capacity: 500, level: 'normal' },
  { areaName: '湖心亭', currentCount: 180, capacity: 200, level: 'warning' },
  { areaName: '北广场', currentCount: 150, capacity: 600, level: 'normal' },
  { areaName: '武术馆', currentCount: 210, capacity: 250, level: 'danger' },
  { areaName: '南门广场', currentCount: 95, capacity: 400, level: 'normal' },
  { areaName: '东门入口', currentCount: 340, capacity: 350, level: 'danger' },
]

const mockShops: Shop[] = [
  { id: '1', name: '宋韵茶坊', location: '民俗街区A1', category: '餐饮', isOpen: true, rentExpiryDate: '2026-09-15', monthlyRevenue: 28500 },
  { id: '2', name: '武侠兵器铺', location: '民俗街区A3', category: '文创', isOpen: true, rentExpiryDate: '2026-07-20', monthlyRevenue: 15200 },
  { id: '3', name: '汴京小吃坊', location: '民俗街区B2', category: '餐饮', isOpen: true, rentExpiryDate: '2026-06-25', monthlyRevenue: 42800 },
  { id: '4', name: '宋代妆造馆', location: '民俗街区C1', category: '体验', isOpen: true, rentExpiryDate: '2026-12-01', monthlyRevenue: 35600 },
  { id: '5', name: '万岁山纪念品', location: '南门商铺D1', category: '文创', isOpen: false, rentExpiryDate: '2026-06-18', monthlyRevenue: 0 },
  { id: '6', name: '清凉饮品站', location: '湖心亭旁', category: '餐饮', isOpen: true, rentExpiryDate: '2026-08-10', monthlyRevenue: 18900 },
  { id: '7', name: '糖画手工坊', location: '民俗街区A5', category: '体验', isOpen: true, rentExpiryDate: '2026-10-30', monthlyRevenue: 9800 },
  { id: '8', name: '古装摄影馆', location: '开封府旁', category: '体验', isOpen: false, rentExpiryDate: '2026-06-14', monthlyRevenue: 22100 },
]

const mockComplaints: Complaint[] = [
  { id: '1', title: '卫生间排队过长', content: '民俗街区附近卫生间排队超过20分钟，游客意见很大', type: '设施', reporterName: '游客张先生', reporterPhone: '138****5678', status: 'processing', assignee: '后勤部-李工', createdAt: `${today} 10:30`, updatedAt: `${today} 11:00`, remark: '已安排临时移动卫生间' },
  { id: '2', title: '演出时间变更未通知', content: '杨家将演出推迟了30分钟才开始，但没有任何通知', type: '服务', reporterName: '游客王女士', reporterPhone: '139****1234', status: 'pending', createdAt: `${today} 11:20`, updatedAt: `${today} 11:20` },
  { id: '3', title: '商铺价格不合理', content: '景区内矿泉水售价8元一瓶，远高于市场价格', type: '价格', reporterName: '游客赵先生', reporterPhone: '137****9876', status: 'resolved', assignee: '商铺管理-陈经理', createdAt: `${today} 09:45`, updatedAt: `${today} 14:30`, remark: '已与商铺沟通，调整价格为5元' },
  { id: '4', title: '停车场指示不清', content: '东门停车场入口标识不明显，绕了很大一圈才找到', type: '设施', reporterName: '游客孙女士', reporterPhone: '136****5555', status: 'pending', createdAt: `${today} 13:15`, updatedAt: `${today} 13:15` },
  { id: '5', title: '儿童走失', content: '5岁男童在北广场与家人走散，穿红色上衣', type: '安全', reporterName: '游客刘女士', reporterPhone: '135****6666', status: 'processing', assignee: '安保部-张队长', createdAt: `${today} 14:00`, updatedAt: `${today} 14:15`, remark: '已安排广播寻人，安保人员在北广场搜索' },
]

const mockPatrolRecords: PatrolRecord[] = [
  { id: '1', staffName: '张队长', route: '东门→民俗街区→开封府→北广场', startTime: `${today} 08:00`, endTime: `${today} 09:30`, photos: [], notes: '东门入口秩序良好，民俗街区地面有少量垃圾已通知保洁', lostItems: [] },
  { id: '2', staffName: '王副队长', route: '南门→湖心亭→武术馆→主舞台', startTime: `${today} 10:00`, endTime: `${today} 11:30`, photos: [], notes: '湖心亭护栏有松动，已设置警示标志', lostItems: [{ id: 'l1', name: '黑色双肩包', description: 'Nike品牌黑色双肩包，内有钱包和钥匙', location: '湖心亭西侧长椅', foundTime: `${today} 10:35`, status: 'registered', contactInfo: '' }] },
  { id: '3', staffName: '李队员', route: '北广场→开封府→民俗街区→东门', startTime: `${today} 14:00`, endTime: `${today} 15:30`, photos: [], notes: '北广场客流较大，已增派安保人员维持秩序', lostItems: [{ id: 'l2', name: '儿童水壶', description: '蓝色儿童保温水壶，杯身有卡通图案', location: '开封府出口处', foundTime: `${today} 14:45`, status: 'registered', contactInfo: '' }] },
]

const mockNotifications: AppNotification[] = [
  { id: '1', title: '暑期夜场活动通知', content: '7月1日至8月31日，景区增设夜场演出，营业时间延长至21:00。请各部门做好排班调整。', type: 'announcement', targetAreas: ['全园区'], status: 'published', publishTime: `${today} 08:00`, isPinned: true, createdAt: `${today} 07:30`, publishHistory: [{ action: 'published', time: `${today} 08:00` }] },
  { id: '2', title: '高温预警广播', content: '今日气温预计达到38°C，请广播站每小时播报一次防暑提示，商铺确保饮品供应充足。', type: 'broadcast', targetAreas: ['全园区'], status: 'published', publishTime: `${today} 09:00`, isPinned: false, createdAt: `${today} 08:45`, publishHistory: [{ action: 'published', time: `${today} 09:00` }] },
  { id: '3', title: '武术馆客流预警', content: '武术馆当前客流已达容量上限，请引导游客前往其他区域参观。', type: 'broadcast', targetAreas: ['武术馆', '南门广场'], status: 'published', publishTime: `${today} 13:30`, isPinned: false, createdAt: `${today} 13:25`, publishHistory: [{ action: 'published', time: `${today} 13:30` }] },
  { id: '4', title: '端午节龙舟赛公告', content: '6月22日端午节当天，湖心亭将举行龙舟赛表演，请提前做好场地布置和客流引导方案。', type: 'announcement', targetAreas: ['湖心亭', '民俗街区'], status: 'draft', isPinned: false, createdAt: `${today} 10:00`, publishHistory: [] },
  { id: '5', title: '每日运营简报模板', content: '今日入园2847人，较昨日增长12%；售票收入18.65万元；演出8场，1场临时取消；投诉3件，1件已处理；商铺营业率92%。', type: 'briefing', targetAreas: ['管理部'], status: 'draft', isPinned: false, createdAt: `${today} 17:00`, publishHistory: [] },
]

interface PersistState {
  teamReservations: TeamReservation[]
  performances: Performance[]
  shops: Shop[]
  complaints: Complaint[]
  patrolRecords: PatrolRecord[]
  notifications: AppNotification[]
}

const PERSIST_KEYS: (keyof PersistState)[] = ['teamReservations', 'performances', 'shops', 'complaints', 'patrolRecords', 'notifications']

const persist = (state: PersistState) => {
  try {
    const saveData: Partial<PersistState> = {}
    for (const key of PERSIST_KEYS) {
      ;(saveData as any)[key] = (state as any)[key]
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData))
  } catch (e) {
    console.warn('Store persist failed:', e)
  }
}

const restore = (): Partial<PersistState> | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Partial<PersistState>
  } catch (e) {
    console.warn('Store restore failed:', e)
    return null
  }
}

const restored = restore()

const computeDailyStats = (state: { performances: Performance[]; shops: Shop[]; complaints: Complaint[] }): DailyStats => {
  const openCount = state.shops.filter((s) => s.isOpen).length
  const activePerformances = state.performances.filter((p) => p.status !== 'cancelled').length
  return {
    date: today,
    totalVisitors: 2847,
    currentInPark: 1523,
    ticketRevenue: 186540,
    complaintCount: state.complaints.length,
    performanceCount: activePerformances,
    shopOpenRate: state.shops.length > 0 ? openCount / state.shops.length : 0,
  }
}

const computeLostItems = (patrolRecords: PatrolRecord[]): LostItem[] =>
  patrolRecords.flatMap((r) => r.lostItems)

interface AppState {
  dailyStats: DailyStats
  ticketSales: TicketSale[]
  teamReservations: TeamReservation[]
  performances: Performance[]
  visitorFlow: VisitorFlowRecord[]
  areaFlows: AreaFlow[]
  shops: Shop[]
  complaints: Complaint[]
  patrolRecords: PatrolRecord[]
  lostItems: LostItem[]
  notifications: AppNotification[]

  addTeamReservation: (reservation: TeamReservation) => void
  updateTeamReservation: (id: string, status: TeamReservation['status']) => void
  addPerformance: (performance: Performance) => void
  updatePerformanceStatus: (id: string, status: Performance['status'], cancelReason?: string) => void
  toggleActorCheckIn: (performanceId: string, actorId: string) => void
  toggleShopStatus: (id: string) => void
  addComplaint: (complaint: Complaint) => void
  updateComplaintStatus: (id: string, status: Complaint['status'], assignee?: string, remark?: string) => void
  addPatrolRecord: (record: PatrolRecord) => void
  addLostItem: (item: LostItem, patrolRecordId?: string) => void
  updateLostItemStatus: (id: string, status: LostItem['status']) => void
  addNotification: (notification: AppNotification) => void
  updateNotification: (id: string, patch: Partial<AppNotification>) => void
  updateNotificationStatus: (id: string, status: AppNotification['status']) => void
  checkScheduledPublish: () => void
  generateBriefing: () => string
}

type BaseState = Omit<AppState,
  'dailyStats' | 'ticketSales' | 'visitorFlow' | 'areaFlows' | 'lostItems'
  | keyof Omit<AppState, keyof PersistState>
> & PersistState

const initialPersisted: PersistState = {
  teamReservations: restored?.teamReservations ?? mockTeamReservations,
  performances: restored?.performances ?? mockPerformances,
  shops: restored?.shops ?? mockShops,
  complaints: restored?.complaints ?? mockComplaints,
  patrolRecords: restored?.patrolRecords ?? mockPatrolRecords,
  notifications: restored?.notifications ?? mockNotifications,
}

export const useStore = create<AppState>((set, get) => ({
  dailyStats: computeDailyStats(initialPersisted),
  ticketSales: mockTicketSales,
  teamReservations: initialPersisted.teamReservations,
  performances: initialPersisted.performances,
  visitorFlow: mockVisitorFlow,
  areaFlows: mockAreaFlows,
  shops: initialPersisted.shops,
  complaints: initialPersisted.complaints,
  patrolRecords: initialPersisted.patrolRecords,
  lostItems: computeLostItems(initialPersisted.patrolRecords),
  notifications: initialPersisted.notifications,

  addTeamReservation: (reservation) =>
    set((state) => {
      const next: BaseState = { ...(state as BaseState), teamReservations: [...state.teamReservations, reservation] }
      persist(next)
      return {
        teamReservations: next.teamReservations,
        dailyStats: computeDailyStats(next),
      }
    }),

  updateTeamReservation: (id, status) =>
    set((state) => {
      const next: BaseState = {
        ...(state as BaseState),
        teamReservations: state.teamReservations.map((r) => (r.id === id ? { ...r, status } : r)),
      }
      persist(next)
      return {
        teamReservations: next.teamReservations,
        dailyStats: computeDailyStats(next),
      }
    }),

  addPerformance: (performance) =>
    set((state) => {
      const next: BaseState = { ...(state as BaseState), performances: [...state.performances, performance] }
      persist(next)
      return {
        performances: next.performances,
        dailyStats: computeDailyStats(next),
      }
    }),

  updatePerformanceStatus: (id, status, cancelReason) =>
    set((state) => {
      const next: BaseState = {
        ...(state as BaseState),
        performances: state.performances.map((p) => (p.id === id ? { ...p, status, cancelReason } : p)),
      }
      persist(next)
      return {
        performances: next.performances,
        dailyStats: computeDailyStats(next),
      }
    }),

  toggleActorCheckIn: (performanceId, actorId) =>
    set((state) => {
      const next: BaseState = {
        ...(state as BaseState),
        performances: state.performances.map((p) =>
          p.id === performanceId
            ? { ...p, actors: p.actors.map((a) => (a.id === actorId ? { ...a, checkedIn: !a.checkedIn } : a)) }
            : p
        ),
      }
      persist(next)
      return { performances: next.performances, dailyStats: computeDailyStats(next) }
    }),

  toggleShopStatus: (id) =>
    set((state) => {
      const next: BaseState = {
        ...(state as BaseState),
        shops: state.shops.map((s) => (s.id === id ? { ...s, isOpen: !s.isOpen } : s)),
      }
      persist(next)
      return { shops: next.shops, dailyStats: computeDailyStats(next) }
    }),

  addComplaint: (complaint) =>
    set((state) => {
      const next: BaseState = { ...(state as BaseState), complaints: [...state.complaints, complaint] }
      persist(next)
      return { complaints: next.complaints, dailyStats: computeDailyStats(next) }
    }),

  updateComplaintStatus: (id, status, assignee, remark) =>
    set((state) => {
      const next: BaseState = {
        ...(state as BaseState),
        complaints: state.complaints.map((c) =>
          c.id === id
            ? { ...c, status, ...(assignee && { assignee }), ...(remark && { remark }), updatedAt: new Date().toLocaleString() }
            : c
        ),
      }
      persist(next)
      return { complaints: next.complaints, dailyStats: computeDailyStats(next) }
    }),

  addPatrolRecord: (record) =>
    set((state) => {
      const next: BaseState = { ...(state as BaseState), patrolRecords: [...state.patrolRecords, record] }
      persist(next)
      return {
        patrolRecords: next.patrolRecords,
        lostItems: computeLostItems(next.patrolRecords),
        dailyStats: computeDailyStats(next),
      }
    }),

  addLostItem: (item, patrolRecordId) =>
    set((state) => {
      const targetId = patrolRecordId || (state.patrolRecords.length > 0 ? state.patrolRecords[0].id : undefined)
      if (!targetId) return state
      const next: BaseState = {
        ...(state as BaseState),
        patrolRecords: state.patrolRecords.map((p) =>
          p.id === targetId ? { ...p, lostItems: [...p.lostItems, item] } : p
        ),
      }
      persist(next)
      return {
        patrolRecords: next.patrolRecords,
        lostItems: computeLostItems(next.patrolRecords),
        dailyStats: computeDailyStats(next),
      }
    }),

  updateLostItemStatus: (id, status) =>
    set((state) => {
      const next: BaseState = {
        ...(state as BaseState),
        patrolRecords: state.patrolRecords.map((p) => ({
          ...p,
          lostItems: p.lostItems.map((i) => (i.id === id ? { ...i, status } : i)),
        })),
      }
      persist(next)
      return {
        patrolRecords: next.patrolRecords,
        lostItems: computeLostItems(next.patrolRecords),
        dailyStats: computeDailyStats(next),
      }
    }),

  addNotification: (notification) =>
    set((state) => {
      const next: BaseState = { ...(state as BaseState), notifications: [...state.notifications, notification] }
      persist(next)
      return { notifications: next.notifications, dailyStats: computeDailyStats(next) }
    }),

  updateNotification: (id, patch) =>
    set((state) => {
      const next: BaseState = {
        ...(state as BaseState),
        notifications: state.notifications.map((n) => (n.id === id ? { ...n, ...patch } : n)),
      }
      persist(next)
      return { notifications: next.notifications, dailyStats: computeDailyStats(next) }
    }),

  updateNotificationStatus: (id, status) =>
    set((state) => {
      const now = new Date().toLocaleString()
      const next: BaseState = {
        ...(state as BaseState),
        notifications: state.notifications.map((n) => {
          if (n.id !== id) return n
          const historyEntry = status === 'published'
            ? { action: 'published' as const, time: now }
            : status === 'revoked'
            ? { action: 'revoked' as const, time: now }
            : null
          return {
            ...n,
            status,
            ...(status === 'published' && { publishTime: now }),
            ...(status === 'draft' && { publishTime: undefined, scheduledPublishTime: undefined }),
            ...(historyEntry && { publishHistory: [...n.publishHistory, historyEntry] }),
          }
        }),
      }
      persist(next)
      return { notifications: next.notifications, dailyStats: computeDailyStats(next) }
    }),

  checkScheduledPublish: () => {
    const state = get()
    const now = new Date()
    const changed = state.notifications.filter((n) => {
      if (n.status !== 'scheduled' || !n.scheduledPublishTime) return false
      return new Date(n.scheduledPublishTime) <= now
    })
    if (changed.length === 0) return
    const nowStr = now.toLocaleString()
    set((state) => {
      const next: BaseState = {
        ...(state as BaseState),
        notifications: state.notifications.map((n) => {
          const shouldPublish = changed.some((c) => c.id === n.id)
          if (!shouldPublish) return n
          return {
            ...n,
            status: 'published' as const,
            publishTime: nowStr,
            scheduledPublishTime: undefined,
            publishHistory: [...n.publishHistory, { action: 'published' as const, time: nowStr }],
          }
        }),
      }
      persist(next)
      return { notifications: next.notifications, dailyStats: computeDailyStats(next) }
    })
  },

  generateBriefing: () => {
    const state = get()
    const { dailyStats, performances, complaints, shops } = state
    const activePerformances = performances.filter((p) => p.status !== 'cancelled')
    const cancelledPerformances = performances.filter((p) => p.status === 'cancelled')
    const resolvedComplaints = complaints.filter((c) => c.status === 'resolved')
    const pendingComplaints = complaints.filter((c) => c.status !== 'resolved')
    const openShops = shops.filter((s) => s.isOpen).length
    return `【万岁山景区每日运营简报】
日期：${dailyStats.date}
━━━━━━━━━━━━━━━━━━━━
📊 入园统计：今日入园 ${dailyStats.totalVisitors} 人，当前在园 ${dailyStats.currentInPark} 人
💰 票务收入：¥${dailyStats.ticketRevenue.toLocaleString()}
🎭 演出情况：共排 ${performances.length} 场，实际演出 ${activePerformances.length} 场，${cancelledPerformances.length > 0 ? `临时取消 ${cancelledPerformances.length} 场` : '无临时取消'}
📢 投诉工单：共 ${complaints.length} 件，已处理 ${resolvedComplaints.length} 件，待处理 ${pendingComplaints.length} 件
🏪 商铺运营：${openShops}/${shops.length} 家营业，营业率 ${shops.length > 0 ? ((openShops / shops.length) * 100).toFixed(0) : 0}%`
  },
}))
