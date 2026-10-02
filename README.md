# EventFlow

### Campus Event Planning & Venue Coordination Platform

EventFlow is a college-focused event coordination platform that helps organizers take an event from **planning → resource checking → approvals → venue booking → confirmation** in one workflow.

It is designed to reduce the need for scattered spreadsheets, messages, forms, and manual coordination when multiple events compete for the same campus venues and resources.

## Problem

College events are often coordinated using separate WhatsApp groups, spreadsheets, forms, and manual approvals. This can make it difficult to:

- Check whether a venue is actually available
- Handle multiple requests for the same venue and time
- Check required event resources
- Track approval status
- Know when a venue is finally booked

## EventFlow Solution

EventFlow brings these steps into one place.

### Key Features

- **Event Creation** — Create an event with date, time, venue, capacity and required resources.
- **Venue Availability** — Check venue conflicts before submitting a request.
- **Competing Venue Requests** — Multiple pending requests can exist for the same venue and time.
- **Sequential Approvals** — Faculty Coordinator → HOD → Principal.
- **Final Venue Booking** — Principal approval confirms and books the venue.
- **Automatic Conflict Handling** — When one competing request is finally approved, other pending requests for the same overlapping slot are rejected automatically.
- **Resource Management** — Check availability of projectors, microphones, speakers, laptops, Wi-Fi and chairs.
- **Event Readiness** — Shows whether venue, capacity, resources, approvals and coordinator requirements are ready.
- **Venue Calendar** — Displays confirmed venue bookings and relevant venue requests.
- **Role-based Views** — Different workflows for Student Coordinator, Faculty Coordinator, HOD, Principal and Venue In-charge.

## Demo Workflow

A typical EventFlow workflow:

```
Create Event
     ↓
Check Venue + Capacity + Resources
     ↓
Submit Venue Request
     ↓
Faculty Approval
     ↓
HOD Approval
     ↓
Principal Approval
     ↓
Venue Booked
     ↓
Event Confirmed
     ↓
Venue Calendar Updated
```

If multiple events request the same venue and overlapping time, the requests remain pending until the approval workflow reaches the final decision. Once one request is approved by the Principal, that venue slot is booked and competing pending requests are automatically rejected.

## Tech Stack

- React
- Vite
- JavaScript
- CSS
- Oxlint

## Running Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

## Project Status

This is an **MVP built for the ZEROSYNTAX hackathon**.

The current version uses in-memory/mock data for events, venues, resources and approvals. A production version could connect these workflows to a backend, authentication, persistent databases and real campus resource/venue systems.

## Team

Built for **ZEROSYNTAX — AlgoClans, ASIET**.
