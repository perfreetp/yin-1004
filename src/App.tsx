import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Ticket from '@/pages/Ticket'
import Performance from '@/pages/Performance'
import VisitorFlow from '@/pages/VisitorFlow'
import Shop from '@/pages/Shop'
import Complaint from '@/pages/Complaint'
import Patrol from '@/pages/Patrol'
import Notification from '@/pages/Notification'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ticket" element={<Ticket />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/visitor-flow" element={<VisitorFlow />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/complaint" element={<Complaint />} />
          <Route path="/patrol" element={<Patrol />} />
          <Route path="/notification" element={<Notification />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
