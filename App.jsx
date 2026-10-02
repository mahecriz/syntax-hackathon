import { useEffect, useRef, useState } from 'react'
import './App.css'
import { allocateVenueBooking, getBookedVenueRequests, getCompetingVenueRequests, getRelevantVenueEvents } from './venueWorkflow.js'

const roles = [
  { name: 'Student Coordinator', description: 'Create events and track approvals', icon: '🎓' },
  { name: 'Faculty Coordinator', description: 'Review and coordinate events', icon: '👩‍🏫' },
  { name: 'HOD', description: 'Review departmental event requests', icon: '🏛️' },
  { name: 'Principal', description: 'Provide final event approval', icon: '✦' },
  { name: 'Venue In-charge', description: 'Manage venue availability', icon: '▦' },
]
const TODAY = new Date()
const TODAY_START = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate())

const navigationByRole = {
  'Student Coordinator': [
    { name: 'Dashboard', page: 'Dashboard', icon: '⌂' },
    { name: 'Create Event', page: 'Create Event', icon: '＋' },
    { name: 'My Events', page: 'My Events', icon: '▤' },
    { name: 'Venue Calendar', page: 'Venue Calendar', icon: '▦' },
    { name: 'Resources', page: 'Resources', icon: '◈' },
  ],
  'Faculty Coordinator': [
    { name: 'Dashboard', page: 'Dashboard', icon: '⌂' },
    { name: 'Approvals', page: 'Approvals', icon: '✓' },
    { name: 'Assigned Events', page: 'My Events', icon: '▤' },
  ],
  HOD: [
    { name: 'Dashboard', page: 'Dashboard', icon: '⌂' },
    { name: 'Approvals', page: 'Approvals', icon: '✓' },
    { name: 'Department Events', page: 'My Events', icon: '▤' },
  ],
  Principal: [
    { name: 'Overview', page: 'Dashboard', icon: '⌂' },
    { name: 'Approvals', page: 'Approvals', icon: '✓' },
    { name: 'Events', page: 'My Events', icon: '▤' },
  ],
  'Venue In-charge': [
    { name: 'Dashboard', page: 'Dashboard', icon: '⌂' },
    { name: 'Venue Calendar', page: 'Venue Calendar', icon: '▦' },
    { name: 'Related Events', page: 'My Events', icon: '▤' },
  ],
}
const roleNavigation = role => navigationByRole[role] || navigationByRole['Student Coordinator']
const initialEvents = [
  { id: 'evt-ai-workshop', name: 'AI Innovation Workshop', type: 'Workshop', date: 'Oct 15, 2026', dateISO: '2026-10-15', time: '2:00 PM – 5:00 PM', startTime: '14:00', endTime: '17:00', venue: 'Seminar Hall', venueRequest: { venue: 'Seminar Hall', date: '2026-10-15', startTime: '14:00', endTime: '17:00', status: 'Requested', requestId: 'vr-ai-workshop' }, department: 'Computer Science', organizer: 'Ananya Rao', participants: 120, facilities: ['Projector', 'Wi-Fi'], requiredResources: ['Projector', 'Wi-Fi'], readiness: 80, status: 'Approved', approval: { faculty: 'Approved', hod: 'Approved', principal: 'Pending' } },
  { id: 'evt-robotics-workshop', name: 'Robotics Workshop', type: 'Workshop', date: 'Oct 15, 2026', dateISO: '2026-10-15', time: '2:00 PM – 5:00 PM', startTime: '14:00', endTime: '17:00', venue: 'Seminar Hall', venueRequest: { venue: 'Seminar Hall', date: '2026-10-15', startTime: '14:00', endTime: '17:00', status: 'Requested', requestId: 'vr-robotics-workshop' }, department: 'Electronics & Communication', organizer: 'Mihir Shah', participants: 90, facilities: ['Projector'], requiredResources: ['Projector'], readiness: 80, status: 'Pending', approval: { faculty: 'Approved', hod: 'Pending', principal: 'Pending' } },
  { id: 'evt-coding-bootcamp', name: 'Coding Bootcamp', type: 'Workshop', date: 'Oct 15, 2026', dateISO: '2026-10-15', time: '2:00 PM – 5:00 PM', startTime: '14:00', endTime: '17:00', venue: 'Seminar Hall', venueRequest: { venue: 'Seminar Hall', date: '2026-10-15', startTime: '14:00', endTime: '17:00', status: 'Requested', requestId: 'vr-coding-bootcamp' }, department: 'Computer Science', organizer: 'Isha Nair', participants: 110, facilities: ['Wi-Fi'], requiredResources: ['Laptop', 'Wi-Fi'], readiness: 80, status: 'Pending', approval: { faculty: 'Approved', hod: 'Approved', principal: 'Pending' } },
  { id: 'evt-zerosyntax', name: 'ZeroSyntax Hackathon', type: 'Hackathon', date: 'Oct 10, 2026', dateISO: '2026-10-10', time: '9:00 AM – 5:00 PM', startTime: '09:00', endTime: '17:00', venue: 'Main Auditorium', venueRequest: { venue: 'Main Auditorium', date: '2026-10-10', startTime: '09:00', endTime: '17:00', status: 'Requested', requestId: 'vr-zerosyntax' }, department: 'Computer Science', organizer: 'Rohan Mehta', participants: 180, facilities: [], requiredResources: ['Laptop', 'Wi-Fi'], readiness: 75, status: 'Pending', approval: { faculty: 'Approved', hod: 'Approved', principal: 'Pending' } },
  { id: 'evt-techfest', name: 'Tech Fest 2026', type: 'Festival', date: 'Oct 18, 2026', dateISO: '2026-10-18', time: '10:00 AM – 4:00 PM', startTime: '10:00', endTime: '16:00', venue: 'Main Ground', venueRequest: { venue: 'Main Ground', date: '2026-10-18', startTime: '10:00', endTime: '16:00', status: 'Booked', requestId: 'vr-techfest' }, department: 'All Departments', organizer: 'Student Council', participants: 600, facilities: ['Stage', 'Microphone'], requiredResources: ['Microphone', 'Speaker'], readiness: 100, status: 'Confirmed', approval: { faculty: 'Approved', hod: 'Approved', principal: 'Approved' } },
]

function Icon({ children, className = '' }) { return <span className={`icon ${className}`} aria-hidden="true">{children}</span> }
function StatusBadge({ status }) { return <span className={`badge ${status.toLowerCase().replaceAll(' ', '-')}`}><i />{status}</span> }
function PageHeader({ eyebrow, title, subtitle, action }) { return <div className="page-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action}</div> }
function StatCard({ icon, label, value, note, tone }) { return <article className="stat-card"><div className={`stat-icon ${tone}`}><Icon>{icon}</Icon></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></article> }
function ReadinessValue({ value }) {
  const [displayValue, setDisplayValue] = useState(value)
  const currentValue = useRef(value)
  useEffect(() => {
    const startValue = currentValue.current
    const startedAt = performance.now()
    let frame
    const animate = now => {
      const progress = Math.min((now - startedAt) / 220, 1)
      const eased = 1 - (1 - progress) ** 2
      const nextValue = Math.round(startValue + (value - startValue) * eased)
      currentValue.current = nextValue
      setDisplayValue(nextValue)
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [value])
  return <b aria-label={`Event readiness ${value}%`}>{displayValue}%</b>
}
function EventCard({ event, compact = false, onOpen }) { return <button type="button" className={`event-card ${compact ? 'compact' : ''}`} onClick={() => onOpen?.(event)} aria-label={`Open event details for ${event.name}`}><div className="event-date"><span>{event.date.split(' ')[0]}</span><b>{event.date.split(' ')[1].replace(',', '')}</b></div><div className="event-info"><div className="event-title-row"><h3>{event.name}</h3><StatusBadge status={event.status} /></div><p><Icon>◷</Icon>{event.time}<span className="dot-sep">·</span><Icon>⌖</Icon>{event.venue}</p>{!compact && <div className="event-dept">{event.department}{event.readiness != null && <span className="readiness-inline">Readiness: <ReadinessValue value={event.readiness} /></span>}{event.venueRequest && <span className={`venue-inline-status ${event.venueRequest.status.toLowerCase()}`}>Venue · {event.venueRequest.status === 'Requested' ? 'Request pending' : event.venueRequest.status === 'Booked' ? 'Booked' : 'Request rejected'}</span>}</div>}</div><span className="icon-button subtle event-open-mark" aria-hidden="true">↗</span></button> }

function Login({ onContinue }) {
  const [selected, setSelected] = useState(roles[0].name)
  return <main className="login-page"><div className="login-brand"><div className="brand-mark">E</div><span>Event<span>Flow</span></span></div><div className="login-content"><div className="login-copy"><div className="eyebrow"><span className="live-dot" /> THE CAMPUS, IN SYNC</div><h1>Every great event<br />starts <em>somewhere.</em></h1><p>Plan, approve and coordinate college events from one place.</p><div className="login-proof"><div className="avatar-stack"><i>AR</i><i>SM</i><i>PK</i><i>+8</i></div><span>Made for the people who make<br />campus life happen.</span></div></div><section className="role-panel"><div className="role-panel-top"><span className="eyebrow">WELCOME TO EVENTFLOW</span><span className="step-count">01 <i>/</i> 02</span></div><h2>How do you work<br />with events?</h2><p className="panel-hint">Choose your role to get started.</p><div className="role-list">{roles.map(role => <button key={role.name} className={`role-option ${selected === role.name ? 'selected' : ''}`} onClick={() => setSelected(role.name)}><span className="role-icon">{role.icon}</span><span className="role-copy"><b>{role.name}</b><small>{role.description}</small></span><span className="radio-mark">{selected === role.name && <i />}</span></button>)}</div><button className="button primary login-button" onClick={() => onContinue(selected)}>Continue to dashboard <span>→</span></button><div className="login-foot">By continuing, you agree to your institution's event policies.</div></section></div><footer className="login-footer"><span>© 2026 EventFlow</span><span>BUILT FOR CAMPUS, BY CAMPUS <i>✳</i></span><span>HELP &amp; SUPPORT ↗</span></footer></main>
}

function Sidebar({ page, setPage, role, mobileOpen, setMobileOpen, events }) {
  const items = roleNavigation(role)
  const stage = { 'Faculty Coordinator': 'faculty', HOD: 'hod', Principal: 'principal' }[role]
  const approvalCount = stage ? events.filter(event => !['Confirmed', 'Rejected', 'Draft'].includes(event.status) && event.approval[stage] === 'Pending' && (stage === 'faculty' || event.approval[stage === 'hod' ? 'faculty' : 'hod'] === 'Approved')).length : 0
  return <><aside className={`sidebar ${mobileOpen ? 'open' : ''}`}><button className="brand-button" onClick={() => setPage('Dashboard')}><span className="brand-mark">E</span><span>Event<span>Flow</span></span></button><div className="workspace-chip"><div className="workspace-icon">N</div><span><b>Northstar College</b><small>Campus operations</small></span><span className="workspace-chevron">⌄</span></div><div className="nav-label">{role === 'Principal' ? 'EXECUTIVE' : role === 'Venue In-charge' ? 'VENUE OPERATIONS' : role === 'Student Coordinator' ? 'PLANNING' : 'REVIEW WORKSPACE'}</div><nav className="main-nav" aria-label={`${role} navigation`}>{items.map(item => <button key={item.name} className={page === item.page ? 'active' : ''} onClick={() => { setPage(item.page); setMobileOpen(false) }}><Icon>{item.icon}</Icon><span>{item.name}</span>{item.page === 'Approvals' && <i className="nav-count">{approvalCount}</i>}</button>)}</nav><div className="sidebar-bottom"><div className="sidebar-user"><div className="user-avatar">{role.split(' ').map(w => w[0]).join('').slice(0, 2)}</div><span><b>{role}</b><small>Northstar College</small></span><span className="static-account-mark" aria-hidden="true">···</span></div></div></aside>{mobileOpen && <button className="scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}</>
}
function Topbar({ page, role, onRoleChange, onMenu }) { return <header className="topbar"><button className="mobile-menu icon-button" onClick={onMenu} aria-label="Open navigation">☰</button><div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>{page}</strong></div><div className="topbar-actions"><div className="search-box static-search" aria-hidden="true"><Icon>⌕</Icon><span>EventFlow workspace</span><kbd>⌘ K</kbd></div><span className="icon-button notification static-icon" aria-hidden="true">♧</span><div className="topbar-divider" /><div className="top-profile"><div className="user-avatar small">{role.split(' ').map(w => w[0]).join('').slice(0, 2)}</div><select aria-label="Switch demo role" value={role} onChange={e => onRoleChange(e.target.value)}>{roles.map(item => <option key={item.name}>{item.name}</option>)}</select><b>⌄</b></div></div></header> }

function Dashboard({ setPage, role, events, onOpenEvent }) {
  const stageKey = { 'Faculty Coordinator': 'faculty', HOD: 'hod', Principal: 'principal' }[role]
  const approvalQueue = stageKey ? events.filter(event => event.status !== 'Confirmed' && event.status !== 'Rejected' && event.status !== 'Draft' && event.approval[stageKey] === 'Pending' && (stageKey === 'faculty' || event.approval[stageKey === 'hod' ? 'faculty' : 'hod'] === 'Approved')) : []
  const departmentEvents = events.filter(event => event.department !== 'All Departments')
  const upcoming = events.filter(event => new Date(`${event.dateISO || event.date}T12:00:00`) >= TODAY_START).sort((a, b) => new Date(a.dateISO || a.date) - new Date(b.dateISO || b.date))
  const pendingCount = events.filter(event => !['Confirmed', 'Rejected', 'Draft'].includes(event.status) && Object.values(event.approval).includes('Pending')).length
  const readinessAlerts = events.filter(event => event.readiness < 100 && !['Rejected', 'Draft'].includes(event.status))
  const copy = {
    'Student Coordinator': { eyebrow: 'EVENT PLANNING', title: 'Plan your next campus event.', subtitle: 'Keep your event, venue, and approvals moving in one place.', action: 'Create Event', mainTitle: 'Your upcoming events', mainSubtitle: 'Dates, readiness, and approval status at a glance.', sideTitle: 'Progress to watch', sideSubtitle: 'Items that may need your attention.' },
    'Faculty Coordinator': { eyebrow: 'FACULTY WORKSPACE', title: 'Review campus event requests.', subtitle: 'See what needs your review and what is coming up next.', action: 'Approvals', mainTitle: 'Awaiting faculty review', mainSubtitle: 'Requests ready for your decision.', sideTitle: 'Upcoming events', sideSubtitle: 'The next events on campus.' },
    HOD: { eyebrow: 'DEPARTMENT OVERSIGHT', title: 'Department event overview.', subtitle: 'Track requests moving through departmental review.', action: 'Approvals', mainTitle: 'Department events', mainSubtitle: 'Requests and scheduled events across departments.', sideTitle: 'HOD review queue', sideSubtitle: 'Faculty-approved requests awaiting your decision.' },
    Principal: { eyebrow: 'EXECUTIVE OVERVIEW', title: 'Campus event approvals.', subtitle: 'A concise view of final decisions and upcoming events.', action: 'Approvals', mainTitle: 'Awaiting final approval', mainSubtitle: 'Events that have completed departmental review.', sideTitle: 'Upcoming events', sideSubtitle: 'Approved and scheduled across campus.' },
    'Venue In-charge': { eyebrow: 'VENUE OPERATIONS', title: 'Venue availability overview.', subtitle: 'Review campus schedules and upcoming allocations.', action: 'Venue Calendar', mainTitle: 'Upcoming venue allocations', mainSubtitle: 'Events scheduled across campus.', sideTitle: 'Venue operations', sideSubtitle: 'Open the calendar to review availability by venue and time.' },
  }[role] || { eyebrow: 'CAMPUS OPERATIONS', title: 'Event overview', subtitle: 'Your campus events in one place.', action: 'My Events', mainTitle: 'Upcoming events', mainSubtitle: 'The next events on campus.', sideTitle: 'Approval status', sideSubtitle: 'Current event workflow.' }
  let stats
  if (role === 'Student Coordinator') stats = [
    { icon: '▤', label: 'My events', value: events.length, note: 'In your workspace', tone: 'blue' },
    { icon: '◷', label: 'Pending approvals', value: pendingCount, note: 'Across your requests', tone: 'amber' },
    { icon: '▦', label: 'Upcoming events', value: upcoming.length, note: 'From today onward', tone: 'green' },
    { icon: '!', label: 'Readiness alerts', value: readinessAlerts.length, note: 'Check venue or approval details', tone: 'amber' },
  ]
  else if (role === 'Faculty Coordinator') stats = [
    { icon: '✓', label: 'Awaiting your review', value: approvalQueue.length, note: 'Ready for faculty decision', tone: 'amber' },
    { icon: '▦', label: 'Upcoming events', value: upcoming.length, note: 'Across campus', tone: 'blue' },
    { icon: '✓', label: 'Faculty approved', value: events.filter(event => event.approval.faculty === 'Approved').length, note: 'Moving through the route', tone: 'green' },
    { icon: '▤', label: 'All event requests', value: events.length, note: 'In the event workspace', tone: 'blue' },
  ]
  else if (role === 'HOD') stats = [
    { icon: '▤', label: 'Department events', value: departmentEvents.length, note: 'Excludes campus-wide events', tone: 'blue' },
    { icon: '◷', label: 'Awaiting HOD review', value: approvalQueue.length, note: 'Faculty-approved requests', tone: 'amber' },
    { icon: '▦', label: 'Upcoming events', value: upcoming.length, note: 'From today onward', tone: 'green' },
    { icon: '✓', label: 'Confirmed', value: events.filter(event => event.status === 'Confirmed').length, note: 'Approved by all stages', tone: 'blue' },
  ]
  else if (role === 'Principal') stats = [
    { icon: '◷', label: 'Awaiting final approval', value: approvalQueue.length, note: 'Cleared HOD review', tone: 'amber' },
    { icon: '▦', label: 'Upcoming events', value: upcoming.length, note: 'Scheduled from today onward', tone: 'blue' },
    { icon: '✓', label: 'Approved events', value: events.filter(event => event.status === 'Confirmed').length, note: 'Final approval completed', tone: 'green' },
    { icon: '◷', label: 'Pending events', value: pendingCount, note: 'Still in the approval route', tone: 'amber' },
  ]
  else stats = [
    { icon: '▦', label: 'Venues in schedule', value: venueNames.length, note: 'Available in venue calendar', tone: 'blue' },
    { icon: '◷', label: 'Upcoming allocations', value: upcoming.length, note: 'Events using campus venues', tone: 'amber' },
    { icon: '▤', label: 'Related events', value: events.length, note: 'Across campus', tone: 'green' },
    { icon: '⌖', label: 'Venue calendar', value: 'Open', note: 'Inspect time slots and conflicts', tone: 'blue' },
  ]
  const mainEvents = role === 'Faculty Coordinator' ? (approvalQueue.length ? approvalQueue : upcoming) : role === 'HOD' ? departmentEvents : role === 'Principal' ? (approvalQueue.length ? approvalQueue : upcoming) : upcoming
  const sideEvents = role === 'Student Coordinator' ? (readinessAlerts.length ? readinessAlerts : upcoming) : role === 'Faculty Coordinator' ? upcoming : role === 'HOD' ? approvalQueue : role === 'Principal' ? upcoming.filter(event => ['Approved', 'Confirmed'].includes(event.status)) : []
  const mainActionPage = role === 'Student Coordinator' ? 'Create Event' : role === 'Faculty Coordinator' || role === 'HOD' || role === 'Principal' ? 'Approvals' : 'Venue Calendar'
  const mainActionLabel = role === 'Student Coordinator' ? 'Create event' : role === 'Venue In-charge' ? 'Open calendar' : role === 'Faculty Coordinator' || role === 'HOD' || role === 'Principal' ? 'Review requests' : 'View events'
  const mainTitle = (role === 'Faculty Coordinator' && !approvalQueue.length) || (role === 'Principal' && !approvalQueue.length) ? 'Upcoming events' : copy.mainTitle
  const sideTitle = role === 'Student Coordinator' && !readinessAlerts.length ? 'Approval progress' : copy.sideTitle
  const progressText = event => {
    if (event.status === 'Confirmed') return 'All approval stages complete'
    if (event.status === 'Rejected') return 'Request rejected'
    const next = [['faculty', 'Faculty review'], ['hod', 'HOD review'], ['principal', 'Principal review']].find(([key]) => event.approval[key] !== 'Approved')
    return next ? `Next: ${next[1]}` : 'Approval in progress'
  }
  return <><PageHeader eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} action={<button className="button primary" onClick={() => setPage(mainActionPage)}>{role === 'Student Coordinator' ? '＋' : role === 'Venue In-charge' ? '▦' : '→'} {role === 'Principal' ? 'Open approvals' : mainActionLabel}</button>} /><div className="stats-grid role-stats-grid">{stats.map(stat => <StatCard key={stat.label} {...stat} />)}</div><div className="dashboard-grid role-dashboard-grid"><section className="content-card upcoming-card role-list-card"><div className="section-head"><div><h2>{mainTitle}</h2><p>{copy.mainSubtitle}</p></div><button className="text-button" onClick={() => setPage(role === 'Student Coordinator' ? 'My Events' : mainActionPage)}>{role === 'Student Coordinator' ? 'View all events' : role === 'Venue In-charge' ? 'Open calendar' : 'Open queue'} <span>→</span></button></div><div className="event-list">{mainEvents.slice(0, 5).map(event => <EventCard key={event.id} event={event} onOpen={onOpenEvent} />)}{mainEvents.length === 0 && <div className="role-empty"><b>{role === 'Faculty Coordinator' || role === 'Principal' ? 'No requests awaiting your review' : 'No events to show'}</b><span>New event requests will appear here as they enter the workflow.</span></div>}</div></section><section className="content-card activity-card role-side-card"><div className="section-head"><div><h2>{sideTitle}</h2><p>{copy.sideSubtitle}</p></div></div>{role === 'Venue In-charge' ? <VenueManagementSummary events={events} setPage={setPage} onOpenEvent={onOpenEvent} /> : <div className="role-summary-list">{sideEvents.slice(0, 5).map(event => <div className="role-summary-item" key={event.id}><div className="role-summary-copy"><b>{event.name}</b><span>{role === 'Student Coordinator' ? progressText(event) : `${event.date} · ${event.venue}`}</span>{role === 'Student Coordinator' && event.readiness < 100 && <small>Readiness {event.readiness}% · Review availability or approvals</small>}</div>{role === 'Student Coordinator' ? <StatusBadge status={event.status} /> : <StatusBadge status={event.status} />}</div>)}{sideEvents.length === 0 && <div className="role-empty"><b>No upcoming events yet</b><span>Events will appear here when they are scheduled.</span></div>}</div>}</section></div><div className="dashboard-bottom"><div><span className="live-dot" /> EVENT WORKSPACE</div><span>{role === 'Venue In-charge' ? 'Venue schedules at a glance' : 'Approval and readiness status at a glance'}</span></div></>
}

const resourceInventory = [
  { id: 'projector-01', name: 'Projector 01', category: 'Projector', status: 'Available', location: 'Seminar Hall Store' },
  { id: 'projector-02', name: 'Projector 02', category: 'Projector', status: 'Booked', location: 'Auditorium' },
  { id: 'mic-a', name: 'Microphone Set A', category: 'Audio', status: 'Available', location: 'AV Desk' },
  { id: 'mic-b', name: 'Microphone Set B', category: 'Audio', status: 'Available', location: 'AV Desk' },
  { id: 'speaker-a', name: 'Speaker System A', category: 'Audio', status: 'Available', location: 'Main Auditorium' },
  { id: 'router-a', name: 'Wi-Fi Router A', category: 'Network', status: 'Available', location: 'IT Office' },
  { id: 'laptop-01', name: 'Laptop 01', category: 'Computer', status: 'Available', location: 'Computer Lab 1' },
  { id: 'chairs', name: 'Chairs', category: 'Furniture', status: 'Available', location: 'Central Store' },
]
const resourceOptions = ['Projector', 'Microphone', 'Speaker', 'Laptop', 'Wi-Fi', 'Chairs']
function checkResourceAvailability(requirements) {
  return requirements.map(name => {
    const match = item => name === 'Projector' ? item.category === 'Projector' : name === 'Microphone' ? item.name.startsWith('Microphone') : name === 'Speaker' ? item.name.startsWith('Speaker') : name === 'Laptop' ? item.name.startsWith('Laptop') : name === 'Wi-Fi' ? item.name.includes('Wi-Fi') : item.name === 'Chairs'
    const items = resourceInventory.filter(match)
    const available = items.find(item => item.status === 'Available')
    const booked = items.find(item => item.status === 'Booked')
    if (booked && available) return { name, available: true, warning: `${booked.name} already booked`, alternative: available.name }
    if (available) return { name, available: true, item: available.name }
    return { name, available: false, warning: booked ? `${booked.name} already booked` : 'No matching resource in inventory' }
  })
}

function CreateEvent({ onCreateEvent, onCheckAvailability, role, events }) {
  const [facilities, setFacilities] = useState([])
  const [requiredResources, setRequiredResources] = useState([])
  const [notice, setNotice] = useState(null)
  const [form, setForm] = useState({ name: '', type: '', department: '', participants: '', date: '', venue: '', startTime: '', endTime: '' })
  const options = ['Projector', 'Wi-Fi', 'AC', 'Microphone', 'Stage', 'Computer Systems', 'Power Backup']
  const venues = ['Main Auditorium', 'Seminar Hall', 'Computer Lab 1', 'Conference Room', 'Main Ground']
  const toggle = value => setFacilities(current => current.includes(value) ? current.filter(item => item !== value) : [...current, value])
  const update = e => { setForm(current => ({ ...current, [e.target.name]: e.target.value })); setNotice(null) }
  const requiredReady = form.name && form.type && form.department && form.date && form.venue && form.startTime && form.endTime && Number(form.participants) > 0 && form.endTime > form.startTime
  const getPayload = () => {
    const result = notice?.checks ? notice : canPreview ? onCheckAvailability({ ...form, participants: Number(form.participants), requiredResources }) : null
    return { ...form, participants: Number(form.participants), facilities, requiredResources, organizer: role, readiness: result?.readiness ?? 0, readinessChecks: result?.checks ?? [] }
  }
  const saveDraft = () => { onCreateEvent({ ...getPayload(), status: 'Draft' }); setNotice({ kind: 'success', title: 'Draft saved', message: 'You can find this event in My Events.' }) }
  const submit = () => { if (!requiredReady) { setNotice({ kind: 'warning', title: 'Complete the required details', message: 'Add the event type, department, date, venue, participants, and a valid time range.' }); return } onCreateEvent({ ...getPayload(), status: 'Pending' }); setNotice({ kind: 'success', title: 'Event submitted', message: 'Your request is now in the approval queue.' }) }
  const checkAvailability = () => { if (!form.venue || !form.date || !form.startTime || !form.endTime || form.endTime <= form.startTime || Number(form.participants) <= 0) { setNotice({ kind: 'warning', title: 'Complete venue, participant, date, and time details', message: 'We need these details to check availability.' }); return } setNotice(onCheckAvailability(getPayload())) }
  const canPreview = Boolean(form.venue && form.date && form.startTime && form.endTime && form.endTime > form.startTime && Number(form.participants) > 0)
  const preview = !notice && canPreview ? onCheckAvailability(getPayload()) : null
  const readinessChecks = notice?.checks || preview?.checks || [{ label: 'Venue', ok: false }, { label: 'Capacity', ok: false }, { label: 'Resources', ok: requiredResources.length === 0 }, { label: 'Approval', ok: false }, { label: 'Faculty Coordinator', ok: false }]
  const readiness = notice?.readiness ?? preview?.readiness ?? Math.round(readinessChecks.filter(item => item.ok).length / readinessChecks.length * 100)
  const previewBooked = canPreview ? getBookedVenueRequests(form, events).length > 0 || getStaticVenueConflicts(form.venue, form.date, toMinutes(form.startTime), toMinutes(form.endTime)).length > 0 : false
  const competingRequests = canPreview && !previewBooked ? getCompetingVenueRequests(form, events) : []
  return <><PageHeader eyebrow="EVENT WORKSPACE / NEW REQUEST" title="Create an event" subtitle="Start with the details. You can save your progress at any time." /><div className="form-layout"><section className="content-card form-card"><div className="form-section-title"><span className="number-tag">01</span><div><h2>Event details</h2><p>Tell us about the event you're planning.</p></div></div><div className="form-grid"><Field label="Event name" required><input name="name" value={form.name} onChange={update} placeholder="e.g. Annual Tech Symposium" required /></Field><Field label="Event type" required><select name="type" value={form.type} onChange={update} required><option value="" disabled>Select event type</option><option>Workshop</option><option>Conference</option><option>Hackathon</option><option>Cultural</option><option>Seminar</option><option>Other</option></select></Field><Field label="Department" required><select name="department" value={form.department} onChange={update} required><option value="" disabled>Select department</option>{['Computer Science', 'Electronics & Communication', 'Mechanical Engineering', 'Business Administration', 'Student Council'].map(x => <option key={x}>{x}</option>)}</select></Field><Field label="Expected participants" required><input name="participants" type="number" min="1" value={form.participants} onChange={update} placeholder="e.g. 120" required /></Field></div><div className="form-divider" /><div className="form-section-title"><span className="number-tag">02</span><div><h2>Date, time &amp; venue</h2><p>Choose when and where the event will take place.</p></div></div><div className="form-grid"><Field label="Event date" required><input name="date" type="date" value={form.date} onChange={update} onInput={update} required /></Field><Field label="Preferred venue" required><select name="venue" value={form.venue} onChange={update} required><option value="" disabled>Select a venue</option>{venues.map(x => <option key={x}>{x}</option>)}</select></Field><Field label="Start time" required><input name="startTime" type="time" value={form.startTime} onChange={update} onInput={update} required /></Field><Field label="End time" required><input name="endTime" type="time" value={form.endTime} onChange={update} onInput={update} required /></Field></div><div className="form-divider" /><div className="form-section-title facilities-title"><span className="number-tag">03</span><div><h2>Required resources &amp; facilities</h2><p>Select everything you'll need for your event.</p></div></div><div className="facility-grid">{options.map(item => <label key={item} className={`facility-option ${facilities.includes(item) ? 'checked' : ''}`}><input type="checkbox" checked={facilities.includes(item)} onChange={() => toggle(item)} /><span className="checkmark">✓</span>{item}</label>)}</div><div className="resources-form-section"><div className="form-section-title resource-subheading"><div><h3>Equipment</h3><p>Choose the equipment needed for this event.</p></div></div><div className="resource-choice-grid">{resourceOptions.map(item => <label key={item} className={`resource-choice ${requiredResources.includes(item) ? 'checked' : ''}`}><input type="checkbox" aria-label={`Required resource: ${item}`} checked={requiredResources.includes(item)} onChange={() => { setRequiredResources(current => current.includes(item) ? current.filter(value => value !== item) : [...current, item]); setNotice(null) }} /><span className="checkmark">✓</span>{item}</label>)}</div></div><div className="form-section-title workflow-step"><span className="number-tag">04</span><div><h2>Availability check</h2><p>Review venue, capacity, and resource conflicts before submitting.</p></div></div>{previewBooked && <div className="venue-request-notice booked" role="status"><b>⚠ {form.venue} already booked for this time</b><span>Choose an alternative venue, or review the venue suggestions after checking availability.</span></div>}{competingRequests.length > 0 && <div className="venue-request-notice" role="status"><b>◷ {competingRequests.length} other {competingRequests.length === 1 ? 'request' : 'requests'} for this venue and time</b><span>Your venue request will be finalized after the approval process.</span></div>}{notice && <div className={`form-notice ${notice.kind === 'success' ? 'success' : ''}`} role="status"><b>{notice.title}</b>{notice.message && <span>{notice.message}</span>}{notice.venueAvailable != null && <span className={notice.venueAvailable ? notice.venueRequested ? 'result-warning' : 'result-positive' : 'result-conflict'}>{notice.venueAvailable ? notice.venueRequested ? `◷ ${notice.competingRequests.length} other requests for this slot — venue request pending` : '✓ Venue available' : `⚠ ${notice.venue} already booked`}</span>}{notice.conflicts?.map((conflict, i) => <span className="result-conflict" key={`venue-${i}`}>⚠ {conflict.venue}: {conflict.name} · {conflict.time}</span>)}{notice.capacity != null && <span className={notice.capacitySufficient ? 'result-positive' : 'result-warning'}>{notice.capacitySufficient ? `✓ Capacity sufficient (${notice.capacity})` : `⚠ Capacity exceeds ${notice.capacity} people at this venue`}</span>}{notice.resourceResults?.map(result => <span className={result.warning ? 'result-warning' : 'result-positive'} key={result.name}>{result.warning ? '⚠' : '✓'} {result.name}: {result.warning ? `${result.warning}${result.alternative ? ` — ${result.alternative} available as an alternative` : ''}` : `${result.item} available`}</span>)}{notice.alternatives?.length > 0 && <><b>Recommended alternatives</b><div className="alternative-list">{notice.alternatives.map(item => <span key={item}>✓ {item} available · capacity {venueCapacities[item]}</span>)}</div></>}{notice.resourceResults?.some(result => result.warning && result.alternative) && <><b>Available resource alternatives</b><div className="alternative-list">{notice.resourceResults.filter(result => result.alternative).map(result => <span key={result.name}>✓ {result.alternative} available</span>)}</div></>}</div>}<div className="availability-action"><button className="button outline" onClick={checkAvailability}>⌕ Check availability</button></div><div className="form-section-title workflow-step"><span className="number-tag">06</span><div><h2>Submission</h2><p>Save a draft or send the request into the approval route.</p></div></div><div className="form-actions"><button className="button secondary" onClick={saveDraft}>Save draft</button><div><button className="button primary" onClick={submit}>Submit for approval <span>→</span></button></div></div></section><aside className="form-aside"><div className="content-card readiness-card"><div className="readiness-head"><span><i className="readiness-step">05</i>Event readiness</span><ReadinessValue value={readiness} /></div><div className="readiness-track"><i style={{ width: `${readiness}%` }} /></div><div className="readiness-checks">{readinessChecks.map(item => <span key={item.label} className={item.ok ? 'ready' : 'not-ready'}><i>{item.ok ? '✓' : '⚠'}</i>{item.label}</span>)}</div></div><div className="content-card tip-card"><div className="tip-icon">✳</div><h3>A smoother way to host</h3><p>Check venue, capacity, and resource availability before submitting for approval.</p><div className="tip-divider" /><div className="tip-stat"><span>Approval route</span><b>Faculty <i>→</i> HOD <i>→</i> Principal</b></div></div><div className="aside-help"><span>Need help planning?</span><a href="mailto:events@northstar.edu">Contact event support ↗</a></div></aside></div></> }
function Field({ label, required, children }) { return <label className="field"><span>{label}{required && <i> *</i>}</span>{children}</label> }

const schedules = {
  'Seminar Hall': [{ start: 9, end: 13, name: 'ECE Workshop', state: 'occupied' }, { start: 13, end: 14, name: 'Available', state: 'available' }, { start: 14, end: 17, name: 'CSE Seminar', state: 'occupied' }, { start: 17, end: 19, name: 'Available', state: 'available' }],
  'Main Auditorium': [{ start: 9, end: 17, name: 'Available', state: 'available' }],
  'Computer Lab 1': [{ start: 9, end: 12, name: 'Programming Lab', state: 'occupied' }, { start: 12, end: 14, name: 'Available', state: 'available' }, { start: 14, end: 16, name: 'AI Workshop', state: 'occupied' }, { start: 16, end: 19, name: 'Available', state: 'available' }],
  'Conference Room': [{ start: 9, end: 11, name: 'Faculty Meeting', state: 'occupied' }, { start: 11, end: 19, name: 'Available', state: 'available' }],
  'Main Ground': [{ start: 9, end: 17, name: 'Available', state: 'available' }],
}
const venueCapacities = { 'Main Auditorium': 500, 'Seminar Hall': 150, 'Computer Lab 1': 60, 'Conference Room': 40, 'Main Ground': 1000 }
const venueNames = Object.keys(schedules)
const toMinutes = value => { const [hours, minutes] = value.split(':').map(Number); return hours * 60 + minutes }
const displayTime = value => { const [hours, minutes] = value.split(':').map(Number); const suffix = hours >= 12 ? 'PM' : 'AM'; return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${suffix}` }
const STATIC_SCHEDULE_DATE = '2026-10-05'
function getStaticVenueConflicts(venue, date, start, end) {
  if (date !== STATIC_SCHEDULE_DATE) return []
  return (schedules[venue] || []).filter(booking => booking.state === 'occupied' && start < booking.end * 60 && end > booking.start * 60).map(booking => ({ venue, name: booking.name, time: `${displayTime(String(booking.start).padStart(2, '0') + ':00')} – ${displayTime(String(booking.end).padStart(2, '0') + ':00')}` }))
}
function checkVenueAvailability(request, events) {
  const start = toMinutes(request.startTime), end = toMinutes(request.endTime), requestedDate = request.dateISO || request.venueRequest?.date || request.date
  const bookedRequests = getBookedVenueRequests(request, events)
  const staticConflicts = getStaticVenueConflicts(request.venue, requestedDate, start, end)
  const conflicts = [...staticConflicts, ...bookedRequests.map(event => ({ venue: request.venue, name: event.name, time: event.time }))]
  const competingRequests = getCompetingVenueRequests(request, events)
  const capacity = venueCapacities[request.venue] || Infinity
  const capacitySufficient = Number(request.participants) <= capacity
  const venueAvailable = conflicts.length === 0
  const alternatives = venueNames.filter(name => name !== request.venue && Number(request.participants || 0) <= (venueCapacities[name] || Infinity) && checkVenueConflicts(name, requestedDate, start, end, events).length === 0)
  return { venue: request.venue, conflicts, competingRequests, venueRequested: competingRequests.length > 0, venueBooked: !venueAvailable, alternatives, capacity, capacitySufficient, venueAvailable, venueStatus: !venueAvailable ? 'Booked' : competingRequests.length ? 'Requested' : 'Available' }
}
function checkVenueConflicts(venue, date, start, end, events) {
  const staticConflicts = getStaticVenueConflicts(venue, date, start, end)
  const request = { venue, date, startTime: `${String(Math.floor(start / 60)).padStart(2, '0')}:${String(start % 60).padStart(2, '0')}`, endTime: `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}` }
  return [...staticConflicts, ...getBookedVenueRequests(request, events).map(event => event.name)]
}
function VenueSchedule() {
  const [venue, setVenue] = useState('Seminar Hall')
  const [date, setDate] = useState('2026-10-05')
  const slots = schedules[venue]
  return <><PageHeader eyebrow="CAMPUS OPERATIONS" title="Venue calendar" subtitle="Find the right space for every campus moment." action={null} /><div className="calendar-controls content-card"><label className="field"><span>Selected date</span><input type="date" value={date} onChange={e => setDate(e.target.value)} /></label><label className="field"><span>Venue</span><select value={venue} onChange={e => setVenue(e.target.value)}>{Object.keys(schedules).map(item => <option key={item}>{item}</option>)}</select></label><div className="selected-venue"><span className="venue-glyph">▦</span><span><small>VIEWING SCHEDULE FOR</small><b>{venue}</b></span></div></div><section className="content-card schedule-card"><div className="section-head"><div><h2>{venue} schedule</h2><p>{new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} <span className="dot-sep">·</span> 9:00 AM – 7:00 PM</p></div><div className="schedule-legend"><span><i className="legend available" /> Available</span><span><i className="legend occupied" /> Occupied</span></div></div><div className="timeline"><div className="time-labels">{['9 AM', '11 AM', '1 PM', '3 PM', '5 PM', '7 PM'].map(t => <span key={t}>{t}</span>)}</div><div className="timeline-track">{slots.map((slot, i) => <div key={`${slot.name}-${i}`} className={`time-slot ${slot.state}`} style={{ left: `${(slot.start - 9) / 10 * 100}%`, width: `${(slot.end - slot.start) / 10 * 100}%` }}><b>{slot.name}</b><span>{formatHour(slot.start)} – {formatHour(slot.end)}</span></div>)}</div><div className="timeline-hours">{[0, 20, 40, 60, 80, 100].map(x => <i key={x} style={{ left: `${x}%` }} />)}</div></div><div className="schedule-foot"><span><i className="live-dot" /> Live venue availability</span><span>Schedule updates automatically <b>↻</b></span></div></section><div className="section-heading-row"><div><h2>Venue availability summary</h2><p>Campus-wide status for October 5</p></div><span className="events-toolbar-note">Campus venues</span></div><div className="venue-summary-grid"><SummaryCard icon="✓" name="Available" count="8" note="Ready to book" tone="green" /><SummaryCard icon="◷" name="Occupied" count="3" note="Currently in use" tone="blue" /><SummaryCard icon="⚒" name="Maintenance" count="1" note="Unavailable today" tone="amber" /></div></> }
function formatHour(hour) { return `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}` }
function SummaryCard({ icon, name, count, note, tone }) { return <article className="summary-card content-card"><div className={`stat-icon ${tone}`}>{icon}</div><div><span>{name}</span><b>{count}</b><small>{note}</small></div></article> }

function VenueCalendar({ events }) { return <><VenueRequestBoard events={events} /><VenueSchedule /></> }

function VenueRequestBoard({ events }) {
  const [venue, setVenue] = useState('Seminar Hall')
  const [date, setDate] = useState('2026-10-15')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const dayRequests = getRelevantVenueEvents({ venue, date, startTime: '00:00', endTime: '23:59' }, events, { includeRejected: true }).filter(event => event.status !== 'Draft')
  const groups = []
  const seenGroups = new Set()
  dayRequests.forEach(event => {
    const members = getRelevantVenueEvents(event, events, { includeRejected: true })
    const signature = members.map(item => item.id).sort().join('|')
    if (!seenGroups.has(signature)) { seenGroups.add(signature); groups.push({ representative: event, members }) }
  })
  const activeRequests = dayRequests.filter(event => !['Draft', 'Rejected'].includes(event.status))
  const selected = selectedRequest ? events.find(event => event.id === selectedRequest) : null
  return <><PageHeader eyebrow="VENUE OPERATIONS / REQUESTS" title="Venue requests" subtitle="Competing requests stay pending until the final venue allocation." action={<span className="static-count-chip">{activeRequests.length} active requests</span>} /><div className="calendar-controls content-card"><label className="field"><span>Selected date</span><input type="date" value={date} onChange={e => setDate(e.target.value)} /></label><label className="field"><span>Venue</span><select value={venue} onChange={e => setVenue(e.target.value)}>{venueNames.map(item => <option key={item}>{item}</option>)}</select></label><div className="selected-venue"><span className="venue-glyph">◷</span><span><small>REQUEST ALLOCATION FOR</small><b>{venue}</b></span></div></div><section className="content-card venue-request-calendar"><div className="venue-calendar-heading"><div><h2>{venue} requests</h2><p>{new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p></div><span className="venue-state requested">{activeRequests.some(event => event.venueRequest?.status === 'Booked') ? 'BOOKED' : activeRequests.length ? 'REQUESTED' : 'AVAILABLE'}</span></div><div className="request-time-axis"><span>9 AM</span><span>11 AM</span><span>1 PM</span><span>3 PM</span><span>5 PM</span><span>7 PM</span></div><div className="request-calendar-track">{groups.map(({ representative, members }) => { const start = toMinutes(representative.startTime), end = toMinutes(representative.endTime); const booked = members.find(item => item.venueRequest?.status === 'Booked' || item.status === 'Confirmed'); return <button key={representative.id} className={`request-time-slot ${booked ? 'booked' : members.length > 1 ? 'contested' : 'requested'}`} style={{ left: `${Math.max(0, (start - 540) / 600 * 100)}%`, width: `${Math.max(8, Math.min(100, (end - start) / 600 * 100))}%` }} onClick={() => setSelectedRequest(representative.id)}><b>{booked ? 'BOOKED' : `${members.length} requests`}</b><span>{displayTime(representative.startTime)}–{displayTime(representative.endTime)}</span></button>})}{!groups.length && <div className="venue-slot-empty">No venue requests for this date.</div>}</div><div className="venue-request-legend"><span><i className="available" /> Available</span><span><i className="requested" /> Requested</span><span><i className="contested" /> Contested</span><span><i className="booked" /> Booked</span></div><p className="venue-request-explainer">Requests are not bookings. Only final Principal approval reserves this venue.</p></section>{selected && <VenueSlotDialog event={selected} events={events} onClose={() => setSelectedRequest(null)} />}</>
}

function VenueSlotDialog({ event, events, onClose }) {
  const dialogRef = useRef(null)
  useEffect(() => { dialogRef.current?.focus() }, [])
  useEffect(() => { const escape = e => { if (e.key === 'Escape') onClose() }; window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape) }, [onClose])
  const request = { venue: event.venue, date: event.dateISO, startTime: event.startTime, endTime: event.endTime }
  const requests = getRelevantVenueEvents(request, events, { includeRejected: true })
  const booked = requests.find(item => item.status === 'Confirmed' || item.venueRequest?.status === 'Booked')
  const displayRequests = requests
  return <div className="dialog-scrim" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}><section className="venue-slot-dialog" ref={dialogRef} role="dialog" tabIndex={-1} aria-modal="true" aria-labelledby="venue-slot-title"><button className="dialog-close" onClick={onClose} aria-label="Close venue slot details">×</button><div className="eyebrow">VENUE SLOT DETAILS</div><h2 id="venue-slot-title">{event.venue}</h2><p>{event.date} · {displayTime(event.startTime)}–{displayTime(event.endTime)}</p><div className="venue-slot-count"><b>{booked ? 'BOOKED' : `${requests.length} requests`}</b><span>{booked ? `Reserved for ${booked.name}` : 'Requests remain pending until final approval.'}</span></div><h3>{booked ? 'Booking and released requests' : 'Requests for this slot'}</h3><ul className="venue-request-list">{displayRequests.map(item => { const status = item.venueRequest?.status || (item.status === 'Confirmed' ? 'Booked' : item.status === 'Rejected' ? 'Rejected' : 'Requested'); const stage = item.status === 'Confirmed' ? 'All approvals complete' : item.status === 'Rejected' ? 'Request released' : item.approval.principal === 'Approved' ? 'Confirmed' : item.approval.hod === 'Approved' ? 'Principal review' : item.approval.faculty === 'Approved' ? 'HOD review' : 'Faculty review'; return <li key={item.id}><div><b>{item.name}</b><span>{item.department} · {item.organizer}</span><small>{stage}{item.rejectionReason ? ` · ${item.rejectionReason}` : ''}</small></div><span className={`venue-state ${status.toLowerCase()}`}>{status}</span></li>})}</ul><button className="button secondary venue-dialog-close" onClick={onClose}>Close</button></section></div>
}

function VenueManagementSummary({ events, setPage, onOpenEvent }) {
  const today = [TODAY.getFullYear(), String(TODAY.getMonth() + 1).padStart(2, '0'), String(TODAY.getDate()).padStart(2, '0')].join('-')
  const requests = events.filter(event => event.venueRequest?.status === 'Requested' && !['Draft', 'Rejected', 'Confirmed'].includes(event.status))
  const booked = events.filter(event => event.venueRequest?.status === 'Booked' && event.status === 'Confirmed')
  const contested = requests.filter(event => getCompetingVenueRequests(event, events).length > 0)
  const todayCount = events.filter(event => event.dateISO === today && event.venueRequest?.status === 'Booked').length
  return <div className="venue-management-summary"><div className="venue-management-stats"><div><span>TODAY'S VENUE STATUS</span><b>{todayCount ? `${todayCount} booked` : 'AVAILABLE'}</b></div><div><span>PENDING REQUESTS</span><b>{requests.length}</b></div><div><span>CONTESTED SLOTS</span><b>{new Set(contested.map(event => `${event.venue}|${event.dateISO}|${event.startTime}|${event.endTime}`)).size}</b></div><div><span>CONFIRMED BOOKINGS</span><b>{booked.length}</b></div></div><section className="content-card venue-management-list"><div className="section-head"><div><h2>Venue management queue</h2><p>Requests, contested slots, and confirmed allocations.</p></div><button className="text-button" onClick={() => setPage('Venue Calendar')}>Open venue calendar →</button></div><div className="venue-management-rows">{[...requests, ...booked].map(event => <button key={event.id} className="venue-management-row" onClick={() => onOpenEvent(event)}><span className={`venue-state ${event.venueRequest.status.toLowerCase()}`}>{event.venueRequest.status}</span><span><b>{event.name}</b><small>{event.venue} · {event.date} · {event.time}</small></span><span className="venue-management-compete">{event.venueRequest.status === 'Booked' ? 'Reserved' : `${1 + getCompetingVenueRequests(event, events).length} requests`}</span><i>↗</i></button>)}</div>{!requests.length && !booked.length && <p className="role-empty">No venue requests yet.</p>}</section></div>
}

function Approvals({ events, role, onAction }) { const stage = { 'Faculty Coordinator': 'faculty', HOD: 'hod', Principal: 'principal' }[role]; const priorStage = stage === 'hod' ? 'faculty' : stage === 'principal' ? 'hod' : null; const waiting = stage ? events.filter(event => event.status !== 'Confirmed' && event.status !== 'Rejected' && event.status !== 'Draft' && event.approval[stage] === 'Pending' && (!priorStage || event.approval[priorStage] === 'Approved')).length : 0; return <><PageHeader eyebrow="REVIEW &amp; DECIDE" title="Approvals" subtitle="Keep great events moving forward." action={<span className="static-count-chip">{waiting} awaiting review</span>} /><div className="approval-overview"><div><span className="approval-number">{String(waiting).padStart(2, '0')}</span><span><b>Awaiting your review</b><small>{role} · Requests are routed by role.</small></span></div><div className="approval-avatars"><span>AR</span><span>RM</span><span>SC</span><small>+1</small></div></div><div className="approval-table content-card"><div className="approval-table-head"><span>EVENT REQUEST</span><span>APPROVAL PROGRESS</span><span>YOUR ACTION</span></div>{events.map((event, i) => <ApprovalRow key={event.id} event={event} index={i} role={role} onAction={onAction} events={events} />)}</div><div className="approvals-note"><span>✳</span><p>Approvals follow the route <b>Faculty Coordinator → HOD → Principal</b>. Event organizers will be notified when a decision is made.</p></div></> }
function VenueRequestSummary({ event, events }) {
  const request = { venue: event.venue, date: event.dateISO, startTime: event.startTime, endTime: event.endTime, id: event.id }
  const competitors = getCompetingVenueRequests(request, events)
  const requests = [event, ...competitors]
  const requestStatus = event.venueRequest?.status || (event.status === 'Confirmed' ? 'Booked' : 'Requested')
  return <div className="principal-venue-request"><div className="principal-venue-heading"><span>VENUE REQUEST</span><b className={`venue-state ${requestStatus.toLowerCase()}`}>{requestStatus}</b></div><strong>{event.venue}</strong><span>{event.date} · {event.time}</span><b className="principal-request-count">{requests.length} requests for this venue and time</b><small>Competing requests</small><ul>{requests.map(requested => <li key={requested.id} className={requested.id === event.id ? 'current-request' : ''}><b>{requested.name}{requested.id === event.id && <i>Current</i>}</b><span>{requested.department} · {requested.status === 'Confirmed' ? 'Booked' : requested.venueRequest?.status || 'Requested'}</span></li>)}</ul></div>
}

function ApprovalRow({ event, index, role, onAction, events }) {
  const [comment, setComment] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [decision, setDecision] = useState(null)
  const [decisionNote, setDecisionNote] = useState('')
  const [decisionError, setDecisionError] = useState('')
  const competingCount = 1 + getCompetingVenueRequests(event, events).length
  const stages = [['student', 'Submitted', event.status === 'Draft' ? 'Draft' : 'Submitted'], ['faculty', 'Faculty review', event.approval.faculty], ['hod', 'HOD review', event.approval.hod], ['principal', 'Principal review', event.approval.principal], ['confirmed', 'Confirmed', event.status === 'Confirmed' ? 'Confirmed' : 'Pending']]
  const roleStage = { 'Faculty Coordinator': 'faculty', HOD: 'hod', Principal: 'principal' }[role]
  const canAct = roleStage && event.approval[roleStage] === 'Pending' && (roleStage === 'faculty' || event.approval[roleStage === 'hod' ? 'faculty' : 'hod'] === 'Approved') && !['Rejected', 'Draft', 'Confirmed'].includes(event.status)
  const readinessChecks = event.readinessChecks || []
  const venueCheck = readinessChecks.find(check => check.label === 'Venue')
  const availabilityHasIssue = readinessChecks.some(check => ['Venue', 'Capacity', 'Resources'].includes(check.label) && !check.ok)
  const resources = event.requiredResources || []
  return <><article className={`approval-row ${canAct ? 'needs-review' : ''}`}><div className="approval-event"><div className={`approval-event-icon tone-${index % 3}`}>{['✳', '⌘', '✦'][index % 3]}</div><div><h3>{event.name}</h3><p>{event.organizer} <span>·</span> {event.department}</p><small><Icon>▦</Icon>{event.date} <Icon>◷</Icon>{event.time} <Icon>⌖</Icon>{event.venue}</small></div>{role === 'Principal' && <VenueRequestSummary event={event} events={events} />}</div><div className="approval-progress-column"><div className="approval-stages">{stages.map(([key, name, state]) => <div key={key} className={`stage ${state.toLowerCase().replaceAll(' ', '-')} ${roleStage === key && canAct ? 'current' : ''}`}><span className="stage-dot">{state === 'Approved' || state === 'Submitted' || state === 'Confirmed' ? '✓' : state === 'Rejected' ? '×' : state === 'Changes Requested' ? '!' : ''}</span><small>{name}</small><b>{state}</b></div>)}</div><div className={`approval-context ${role === 'Principal' ? 'executive' : ''}`}><span>{event.participants || '—'} participants</span><span className={`readiness-chip ${availabilityHasIssue || event.readiness < 80 ? 'attention' : 'good'}`}>Readiness {event.readiness ?? 0}%</span>{role !== 'Principal' && resources.length > 0 && <span className="requested-resources">Resources: {resources.join(' · ')}</span>}<span className={availabilityHasIssue ? 'availability-flag conflict' : 'availability-flag'}>{availabilityHasIssue ? 'Availability needs attention' : venueCheck?.ok === true ? 'Venue and resources available' : 'Availability checked'}</span></div>{event.status === 'Confirmed' && <div className="confirmed-message">Event confirmed</div>}</div><div className="approval-actions">{canAct ? <><span className="review-stage-label">{role === 'Principal' ? 'Final decision' : `${role} review`}</span><div><button className="decision-button approve" aria-label={`Approve ${event.name}`} onClick={() => { setDecisionNote(''); setDecisionError(''); setDecision('approve') }}><span>✓</span>{role === 'Principal' ? <span><b>APPROVE EVENT</b><small>Confirm and reserve the selected venue.</small></span> : 'Approve'}</button><button className="decision-button reject" aria-label={`Reject ${event.name}`} onClick={() => { setDecisionNote(''); setDecisionError(''); setDecision('reject') }}><span>×</span>{role === 'Principal' ? <span><b>REJECT EVENT</b><small>Return with a reason.</small></span> : 'Reject'}</button><button className="icon-button more-action" aria-label="Request changes" onClick={() => setRequesting(value => !value)}>···</button></div></> : <span className="event-state-label">{event.status === 'Confirmed' ? 'Confirmed' : event.status === 'Rejected' ? 'Rejected' : 'No action'}</span>}</div>{requesting && canAct && <div className="change-request-box"><input value={comment} onChange={e => setComment(e.target.value)} placeholder="What should the organizer change?" aria-label="Change request comment" /><button className="button outline" disabled={!comment.trim()} onClick={() => { onAction(event.id, 'changes', roleStage, comment.trim()); setRequesting(false) }}>Send request</button></div>}</article>{decision && <DecisionDialog event={event} role={role} action={decision} note={decisionNote} setNote={setDecisionNote} competingCount={competingCount} error={decisionError} onClose={() => setDecision(null)} onConfirm={() => { const result = onAction(event.id, decision, roleStage, decisionNote.trim()); if (result?.error) setDecisionError(result.error); else setDecision(null) }} />} </>
}

function DecisionDialog({ event, role, action, note, setNote, onClose, onConfirm, competingCount, error }) {
  const dialogRef = useRef(null)
  useEffect(() => { dialogRef.current?.focus() }, [])
  useEffect(() => { const escape = e => { if (e.key === 'Escape') onClose() }; window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape) }, [onClose])
  const rejecting = action === 'reject'
  const title = rejecting ? 'Reject this event?' : role === 'Principal' ? 'Confirm final approval' : `Confirm ${role} approval`
  return <div className="dialog-scrim" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}><section className="decision-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="decision-title" onKeyDown={e => { if (e.key === 'Escape') onClose() }} tabIndex={-1}><button className="dialog-close" onClick={onClose} aria-label="Close dialog">×</button><span className={`dialog-mark ${rejecting ? 'reject' : 'approve'}`}>{rejecting ? '×' : '✓'}</span><div className="eyebrow">{role === 'Principal' ? 'FINAL DECISION' : role.toUpperCase()}</div><h2 id="decision-title">{title}</h2><p className="dialog-event-name">{event.name}</p><p className="dialog-event-meta">{event.venue}<br />{event.date} · {event.time}<br />{event.participants} participants</p>{role === 'Principal' && !rejecting && <div className="booking-confirm-summary"><b>{competingCount} requests exist for this venue and time.</b><span>This approval will reserve the venue and automatically release competing pending requests.</span></div>}{error && <div className="booking-error" role="alert">{error}</div>}<p className="dialog-explanation">{rejecting ? 'Add a reason or suggestion for the organizer (optional).' : role === 'Principal' ? 'This will confirm the event and reserve the selected venue.' : 'This approval will move the request to the next review stage.'}</p><label className="decision-note"><span>Decision Note <small>Optional</small></span><textarea value={note} onChange={e => setNote(e.target.value)} placeholder={rejecting ? 'Add a reason or suggestion (optional)...' : 'Add an optional note for the organizer...'} rows="3" /></label><div className="dialog-actions"><button className="button secondary" onClick={onClose}>Cancel</button><button className={`button ${rejecting ? 'reject-confirm' : 'primary'}`} onClick={onConfirm}>{rejecting ? 'Confirm Rejection' : role === 'Principal' ? 'Confirm & Book Venue' : 'Confirm Approval'}</button></div></section></div>
}

function EventDetailDialog({ event, events, role, onClose }) {
  const dialogRef = useRef(null)
  useEffect(() => { dialogRef.current?.focus() }, [])
  useEffect(() => { const escape = e => { if (e.key === 'Escape') onClose() }; window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape) }, [onClose])
  const fallbackVenue = checkVenueAvailability(event, events.filter(item => item.id !== event.id))
  const fallbackResources = checkResourceAvailability(event.requiredResources || [])
  const checks = event.readinessChecks?.length ? event.readinessChecks : [{ label: 'Venue', ok: fallbackVenue.venueAvailable }, { label: 'Capacity', ok: fallbackVenue.capacitySufficient }, { label: 'Resources', ok: fallbackResources.every(item => item.available) }, { label: 'Approval', ok: event.status === 'Confirmed' }, { label: 'Faculty Coordinator', ok: event.approval?.faculty === 'Approved' }]
  const stages = [['Submitted', true], ['Faculty Coordinator', event.approval?.faculty === 'Approved'], ['HOD', event.approval?.hod === 'Approved'], ['Principal', event.approval?.principal === 'Approved']]
  const venuePeers = getRelevantVenueEvents(event, events, { includeRejected: true }).filter(item => item.id !== event.id)
  const venueStatus = event.venueRequest?.status || (event.status === 'Confirmed' ? 'Booked' : 'Requested')
  return <div className="dialog-scrim" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}><section className="event-detail-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="event-detail-title" onKeyDown={e => { if (e.key === 'Escape') onClose() }} tabIndex={-1}><button className="dialog-close" onClick={onClose} aria-label="Close event details">×</button><div className="eyebrow">{role === 'Principal' || role === 'HOD' ? 'EXECUTIVE EVENT REVIEW' : 'EVENT OVERVIEW'}</div><div className="detail-title-row"><div><h2 id="event-detail-title">{event.name}</h2><p>{event.type} · {event.department} · Organized by {event.organizer}</p></div><StatusBadge status={event.status} /></div><div className="detail-overview-grid"><div><small>DATE &amp; TIME</small><b>{event.date}</b><span>{event.time}</span></div><div><small>VENUE</small><b>{event.venue}</b><span>{event.participants} participants</span></div><div><small>READINESS</small><ReadinessValue value={event.readiness ?? 0} /></div></div><div className="detail-venue-request"><div><small>VENUE REQUEST</small><b>{event.venue}</b><span>{event.date} · {event.time}</span></div><span className={`venue-state ${venueStatus.toLowerCase()}`}>{venueStatus}</span>{venuePeers.length > 0 && <div className="detail-venue-peers"><b>{venuePeers.length + 1} requests for this venue and time</b><span>{venuePeers.map(peer => `${peer.name} · ${peer.venueRequest?.status || peer.status}`).join("  •  ")}</span></div>}{event.rejectionReason && <p className="venue-rejection-reason"><b>Venue request rejected</b><span>{event.rejectionReason}</span></p>}</div><div className="detail-section"><div className="detail-section-heading"><h3>Readiness</h3><span>{event.readiness ?? 0}% complete</span></div><div className="readiness-track detail-track"><i style={{ width: `${event.readiness ?? 0}%` }} /></div><div className="detail-checks">{checks.map(check => <span key={check.label} className={check.ok ? 'ready' : check.ok === false ? 'not-ready' : ''}><i>{check.ok ? '✓' : check.ok === false ? '⚠' : '·'}</i>{check.label}</span>)}</div></div><div className="detail-columns"><div className="detail-section"><h3>Requested resources</h3><p>{[...(event.requiredResources || []), ...(event.facilities || [])].length ? [...new Set([...(event.requiredResources || []), ...(event.facilities || [])])].join(' · ') : 'No specific resources requested'}</p></div><div className="detail-section"><h3>Approval progress</h3><div className="detail-stages">{stages.map(([label, done], index) => <span key={label} className={done ? 'done' : index === stages.findIndex(([, passed]) => !passed) ? 'current' : ''}><i>{done ? '✓' : index + 1}</i>{label}</span>)}</div></div></div><div className="detail-footer"><span>Current status</span><StatusBadge status={event.status} /><button className="button secondary" onClick={onClose}>Close details</button></div></section></div>
}

function MyEvents({ events, setPage, flash, clearFlash, role, onOpenEvent }) {
  const [filter, setFilter] = useState('All')
  const filters = ['All', 'Pending', 'Approved', 'Confirmed', 'Completed']
  const filtered = events.filter(event => filter === 'All' || event.status === filter)
  const copy = {
    'Student Coordinator': { title: 'My events', subtitle: 'Track your event requests, readiness, and next approval step.', action: '＋ Create event' },
    'Faculty Coordinator': { title: 'Assigned events', subtitle: 'Review the events moving through faculty coordination.' },
    HOD: { title: 'Department events', subtitle: 'Track departmental requests and their approval progress.' },
    Principal: { title: 'Campus events', subtitle: 'A concise record of upcoming and approved campus events.' },
    'Venue In-charge': { title: 'Related events', subtitle: 'Review event allocations associated with campus venues.' },
  }[role] || { title: 'Events', subtitle: 'Track event requests and their current status.' }
  return <><PageHeader eyebrow={role === 'Principal' ? 'CAMPUS EVENTS' : 'EVENT WORKSPACE'} title={copy.title} subtitle={copy.subtitle} action={role === 'Student Coordinator' ? <button className="button primary" onClick={() => setPage('Create Event')}>{copy.action}</button> : null} />{flash && <div className="form-notice success event-flash" role="status"><span>✓ {flash}</span><button onClick={clearFlash} aria-label="Dismiss message">×</button></div>}<div className="my-events-toolbar content-card"><div className="filter-tabs">{filters.map(status => <button key={status} className={filter === status ? 'active' : ''} onClick={() => setFilter(status)}>{status}{status === 'Pending' && <i>{events.filter(event => event.status === status).length}</i>}</button>)}</div><span className="events-toolbar-note">{filtered.length} {filtered.length === 1 ? 'event' : 'events'}</span></div><div className="my-event-list">{filtered.map(event => <div className="my-event-entry" key={event.id}><EventCard event={event} onOpen={onOpenEvent} />{event.rejectionReason && <div className="venue-rejection-reason"><b>Venue request rejected</b><span>{event.rejectionReason}</span></div>}</div>)}{filtered.length === 0 && <div className="empty-state content-card"><span>✳</span><h3>No {filter.toLowerCase()} events</h3><p>Events will show here when they match this status.</p></div>}</div><div className="events-foot">Showing <b>{filtered.length}</b> of {events.length} events <span>Updated just now</span></div></>
}
function Resources({ inventory }) { const [filter, setFilter] = useState('All'); const [query, setQuery] = useState(''); const available = inventory.filter(item => item.status === 'Available').length; const booked = inventory.filter(item => item.status === 'Booked').length; const visible = inventory.filter(item => (filter === 'All' || item.status === filter) && `${item.name} ${item.category} ${item.location}`.toLowerCase().includes(query.toLowerCase())); return <><PageHeader eyebrow="CAMPUS OPERATIONS" title="Resources" subtitle="Check what’s available across campus." /><div className="stats-grid resource-stats"><StatCard icon="◈" label="Total resources" value={inventory.length} note="Tracked campus items" tone="blue" /><StatCard icon="✓" label="Available" value={available} note="Ready to allocate" tone="green" /><StatCard icon="◷" label="Booked" value={booked} note="Currently in use" tone="amber" /><StatCard icon="▦" label="Categories" value={new Set(inventory.map(item => item.category)).size} note="Across campus" tone="violet" /></div><div className="resource-toolbar"><div><h2>Resource inventory</h2><p>Equipment, category, location, and current status</p></div><label className="search-box resource-search"><Icon>⌕</Icon><input placeholder="Find a resource..." value={query} onChange={e => setQuery(e.target.value)} /></label></div><div className="resource-filter-tabs">{['All', 'Available', 'Booked'].map(item => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}{item === 'Available' && <i>{available}</i>}{item === 'Booked' && <i>{booked}</i>}</button>)}</div><div className="resource-grid inventory-grid">{visible.map((resource, index) => <ResourceCard resource={resource} index={index} key={resource.id} />)}{visible.length === 0 && <div className="empty-state content-card"><span>◈</span><h3>No resources found</h3><p>Try another search or filter.</p></div>}</div></> }
function ResourceCard({ resource, index }) { return <article className="resource-card content-card inventory-card"><div className="resource-title"><div className={`resource-icon tone-${index % 4}`}>◈</div><div><h3>{resource.name}</h3><span>{resource.location}</span></div><span className={`resource-status ${resource.status.toLowerCase()}`}><i />{resource.status}</span></div><div className="inventory-card-meta"><span>Category</span><b>{resource.category}</b></div></article> }

function Placeholder({ page }) { return <><PageHeader eyebrow="EVENTFLOW WORKSPACE" title={page} subtitle={`Manage your ${page.toLowerCase()} and campus preferences.`} /><div className="content-card placeholder-card"><div className="placeholder-icon">✳</div><h2>{page} settings</h2><p>This workspace is ready to be configured for your college.</p><button className="button outline">Edit {page.toLowerCase()}</button></div></> }

function App() {
  const [role, setRole] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [page, setPage] = useState('Dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [events, setEvents] = useState(initialEvents)
  const [flash, setFlash] = useState('')
  const createEvent = payload => {
    const id = `evt-${Date.now()}`
    const event = { ...payload, id, dateISO: payload.date, date: new Date(`${payload.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), time: `${displayTime(payload.startTime)} – ${displayTime(payload.endTime)}`, venueRequest: { venue: payload.venue, date: payload.date, startTime: payload.startTime, endTime: payload.endTime, status: 'Requested', requestId: `vr-${id}` }, approval: { faculty: 'Pending', hod: 'Pending', principal: 'Pending' }, comment: '' }
    setEvents(current => [event, ...current])
    setFlash(payload.status === 'Draft' ? 'Draft saved to My Events.' : 'Event submitted for approval and added to My Events.')
    setPage('My Events')
  }
  const checkEventAvailability = request => {
    const venueResult = checkVenueAvailability(request, events)
    const resourceResults = checkResourceAvailability(request.requiredResources || [])
    const resourcesAvailable = resourceResults.every(result => result.available)
    const checks = [
      { label: 'Venue', ok: venueResult.venueAvailable },
      { label: 'Capacity', ok: venueResult.capacitySufficient },
      { label: 'Resources', ok: resourcesAvailable },
      { label: 'Approval', ok: false },
      { label: 'Faculty Coordinator', ok: false },
    ]
    const readiness = Math.round(checks.filter(item => item.ok).length * 100 / checks.length)
    return { ...venueResult, resourceResults, resourcesAvailable, checks, readiness, kind: venueResult.venueAvailable && venueResult.capacitySufficient && resourcesAvailable ? 'success' : 'warning', title: !venueResult.venueAvailable ? 'Venue already booked' : venueResult.venueRequested ? `${venueResult.competingRequests.length} other requests for this slot` : 'Venue available' }
  }
  const handleApproval = (eventId, action, stage, comment = '') => {
    const target = events.find(event => event.id === eventId)
    if (!target) return { error: 'This event is no longer in the approval list.' }
    const finalBooking = action === 'approve' && stage === 'principal'
    if (finalBooking) {
      const staticConflicts = getStaticVenueConflicts(target.venue, target.dateISO, toMinutes(target.startTime), toMinutes(target.endTime))
      const allocation = allocateVenueBooking(events, eventId, comment, staticConflicts.length > 0)
      if (allocation.error) return allocation
      const result = allocation.event.readinessChecks?.length ? allocation.event : (() => {
        const venueResult = checkVenueAvailability(target, events.filter(event => event.id !== target.id))
        const resourceResults = checkResourceAvailability(target.requiredResources || [])
        return { ...allocation.event, readinessChecks: [{ label: 'Venue', ok: venueResult.venueAvailable }, { label: 'Capacity', ok: venueResult.capacitySufficient }, { label: 'Resources', ok: resourceResults.every(item => item.available) }, { label: 'Approval', ok: true }, { label: 'Faculty Coordinator', ok: true }] }
      })()
      const readinessChecks = result.readinessChecks.map(check => check.label === 'Approval' || check.label === 'Faculty Coordinator' ? { ...check, ok: true } : check)
      const nextEvents = allocation.events.map(event => event.id === eventId ? { ...event, readinessChecks, readiness: Math.round(readinessChecks.filter(check => check.ok).length * 100 / readinessChecks.length) } : event)
      setEvents(nextEvents)
      return { success: true }
    }
    setEvents(current => current.map(event => {
      if (event.id === eventId) {
        if (action === 'reject') return { ...event, status: 'Rejected', decisionNote: comment, comment, venueRequest: { ...event.venueRequest, status: 'Rejected' }, approval: { ...event.approval, [stage]: 'Rejected' } }
        if (action === 'changes') return { ...event, comment, approval: { ...event.approval, [stage]: 'Changes Requested' } }
        const approval = { ...event.approval, [stage]: 'Approved' }
        const status = Object.values(approval).every(value => value === 'Approved') ? 'Confirmed' : 'Pending'
        const venueRequest = event.venueRequest
        const storedChecks = event.readinessChecks?.length ? event.readinessChecks : (() => {
          const venueResult = checkVenueAvailability(event, current.filter(item => item.id !== event.id))
          const resourceResults = checkResourceAvailability(event.requiredResources || [])
          return [
            { label: 'Venue', ok: venueResult.venueAvailable },
            { label: 'Capacity', ok: venueResult.capacitySufficient },
            { label: 'Resources', ok: resourceResults.every(result => result.available) },
            { label: 'Approval', ok: false },
            { label: 'Faculty Coordinator', ok: approval.faculty === 'Approved' },
          ]
        })()
        const readinessChecks = storedChecks.map(check => {
          if (check.label === 'Approval') return { ...check, ok: status === 'Confirmed' }
          if (check.label === 'Faculty Coordinator') return { ...check, ok: approval.faculty === 'Approved' }
          return check
        })
        const readiness = readinessChecks.length ? Math.round(readinessChecks.filter(check => check.ok).length * 100 / readinessChecks.length) : event.readiness
        return { ...event, approval, status, venueRequest, decisionNote: comment, comment, readinessChecks, readiness }
      }
      return event
    }))
    return { success: true }
  }
  const changeRole = nextRole => {
    setRole(nextRole)
    if (!roleNavigation(nextRole).some(item => item.page === page)) setPage('Dashboard')
    setMobileOpen(false)
  }
  const pageLabel = roleNavigation(role).find(item => item.page === page)?.name || page
  let pageContent
  switch (page) {
    case 'Dashboard': pageContent = <Dashboard setPage={setPage} role={role} events={events} onOpenEvent={setSelectedEvent} />; break
    case 'Create Event': pageContent = <CreateEvent onCreateEvent={createEvent} onCheckAvailability={checkEventAvailability} role={role} events={events} />; break
    case 'My Events': pageContent = <MyEvents events={events} setPage={setPage} flash={flash} clearFlash={() => setFlash('')} role={role} onOpenEvent={setSelectedEvent} />; break
    case 'Venue Calendar': pageContent = <VenueCalendar events={events} />; break
    case 'Approvals': pageContent = <Approvals events={events} role={role} onAction={handleApproval} />; break
    case 'Resources': pageContent = <Resources inventory={resourceInventory} />; break
    default: pageContent = <Placeholder page={page} />
  }
  if (!role) return <Login onContinue={setRole} />
  return <><div className="app-shell"><Sidebar page={page} setPage={setPage} role={role} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} events={events} /><div className="main-column"><Topbar page={pageLabel} role={role} onRoleChange={changeRole} onMenu={() => setMobileOpen(true)} /><main className="page-content" key={page}>{pageContent}<footer className="app-footer"><span>© 2026 EventFlow · Northstar College</span><span>Made for better campus moments <i>✳</i></span></footer></main></div></div>{selectedEvent && <EventDetailDialog event={events.find(event => event.id === selectedEvent.id) || selectedEvent} events={events} role={role} onClose={() => setSelectedEvent(null)} />}</>
}

export default App
