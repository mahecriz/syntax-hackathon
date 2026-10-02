export function rangesOverlap(firstStart, firstEnd, secondStart, secondEnd) {
  return firstStart < secondEnd && firstEnd > secondStart
}

export function eventVenueWindow(event) {
  const request = event.venueRequest || event
  return {
    venue: request.venue || event.venue,
    date: request.dateISO || request.date || event.dateISO,
    startTime: request.startTime || event.startTime,
    endTime: request.endTime || event.endTime,
  }
}

export function getCompetingVenueRequests(request, events, { excludeId = request.id } = {}) {
  const requestedWindow = eventVenueWindow(request)
  const start = request.startTime
  const end = request.endTime
  return events.filter(event => {
    if (event.id === excludeId || !['Pending', 'Approved', 'Confirmed'].includes(event.status)) return false
    const window = eventVenueWindow(event)
    if (window.venue !== requestedWindow.venue || window.date !== requestedWindow.date || !window.startTime || !window.endTime) return false
    if (event.venueRequest?.status === 'Rejected') return false
    return rangesOverlap(start, end, window.startTime, window.endTime)
  })
}

export function allocateVenueBooking(events, eventId, note = '', hasStaticBooking = false) {
  const target = events.find(event => event.id === eventId)
  if (!target) return { error: 'This event is no longer in the approval list.' }
  if (hasStaticBooking || getBookedVenueRequests(target, events).length) return { error: 'This venue has already been booked by another approved event.' }
  const competing = getCompetingVenueRequests(target, events).filter(event => event.status !== 'Confirmed' && event.venueRequest?.status !== 'Booked')
  const rejectionReason = 'Venue unavailable — another event was approved for this time slot.'
  const nextEvents = events.map(event => {
    if (event.id === eventId) return { ...event, status: 'Confirmed', decisionNote: note, comment: note, venueRequest: { ...event.venueRequest, venue: event.venue, date: event.dateISO, startTime: event.startTime, endTime: event.endTime, status: 'Booked', requestId: event.venueRequest?.requestId || `vr-${event.id}` }, approval: { ...event.approval, principal: 'Approved' } }
    if (competing.some(item => item.id === event.id)) return { ...event, status: 'Rejected', rejectionReason, comment: rejectionReason, venueRequest: { ...event.venueRequest, status: 'Rejected' }, approval: { ...event.approval, principal: 'Rejected' } }
    return event
  })
  return { events: nextEvents, event: nextEvents.find(event => event.id === eventId), rejectedIds: competing.map(event => event.id) }
}

export function getBookedVenueRequests(request, events, { excludeId = request.id } = {}) {
  const requestedWindow = eventVenueWindow(request)
  return events.filter(event => {
    if (event.id === excludeId || event.status !== 'Confirmed') return false
    const window = eventVenueWindow(event)
    if (window.venue !== requestedWindow.venue || window.date !== requestedWindow.date || !window.startTime || !window.endTime) return false
    if (event.venueRequest && event.venueRequest.status !== 'Booked') return false
    return rangesOverlap(request.startTime, request.endTime, window.startTime, window.endTime)
  })
}

export function getConfirmedVenueBookings(events, venue, date) {
  return events.filter(event => event.status === 'Confirmed' && event.venueRequest?.status === 'Booked' && event.dateISO === date && event.venue === venue && event.startTime && event.endTime)
}

export function getRelevantVenueEvents(request, events, { includeRejected = false } = {}) {
  const requestedWindow = eventVenueWindow(request)
  return events.filter(event => {
    const window = eventVenueWindow(event)
    if (window.venue !== requestedWindow.venue || window.date !== requestedWindow.date || !window.startTime || !window.endTime) return false
    if (!['Pending', 'Approved', 'Confirmed'].includes(event.status) && !(includeRejected && event.status === 'Rejected')) return false
    return rangesOverlap(request.startTime, request.endTime, window.startTime, window.endTime)
  })
}
