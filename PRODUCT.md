# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

- **Teachers**: Educators in classrooms and on campus requiring rapid daily attendance marking, student and parent communications, homework assignment, timetable review, and grading.
- **Parents**: Guardians tracking their children's daily attendance, academic progress, exam results, school announcements, direct teacher messages, and fee status across one or multiple enrolled wards.
- **Students**: Learners accessing daily schedules, homework deadlines, examination results, announcements, and school events.
- **School Administrators / Super Admins**: Confirmed out-of-scope for the mobile app; guided via in-app screen to the comprehensive web portal.

## Product Purpose

Volpe School ERP Mobile (`SchoolErpMobile`) is the official cross-platform mobile companion for the Volpe V-Schools platform (`volpehub.in`). It eliminates school-home communication friction and streamlines high-frequency daily routines—attendance, urgent notices, fees, homework, and schedules—into instant, role-optimized mobile interactions without requiring desktop access.

## Positioning

A lightweight, role-isolated mobile client connected to the unified Volpe Hub backend (`https://volpehub.in/api/v1`). It combines real-time WebSocket messaging (`wss://volpehub.in/ws/chat/`), offline-first credential persistence with secure biometric/keychain storage, and strict zero-trust client boundary protection.

## Operating Context

- **Usage Environments**: Teachers on campus between classes; parents checking quick notifications during commutes or work; students verifying timetables and homework.
- **Network Variability**: Operates across school Wi-Fi and mobile 4G/5G data with defensive offline handling, heartbeat monitoring (`apiHeartbeat`), and automatic token refresh.
- **Device Ergonomics**: Handheld smartphone devices (iOS and Android) primarily in portrait orientation, accommodating soft keyboards, dynamic system text scaling, and platform-specific safe areas (notches, dynamic islands, navigation bars).

## Capabilities and Constraints

- **Confirmed Functionality**:
  - Dedicated role-segmented dashboards (`TeacherDashboard`, `ParentDashboard`, `StudentDashboard`).
  - Attendance marking, status counters, and history reports.
  - Multi-ward selector for parents with multiple enrolled children.
  - Fee metrics, payment status tracking, and breakdown cards.
  - Homework and assignment workflows.
  - Real-time 1:1 and group chat via WebSockets.
  - School announcements, notifications feed, and events calendar.
  - Mandatory password change enforcement (`ForcedPasswordModal`) on first login or credential reset.
  - Built-in API inspector drawer during development builds.
- **Technical Constraints**:
  - React Native 0.81.4, React 19.1.0, TypeScript 5.8.3.
  - State & Data: Redux Toolkit, Redux Persist, TanStack React Query.
  - Storage & Security: `react-native-keychain`, `@react-native-async-storage/async-storage`.
  - Security Contract: Client-side defense-in-depth with deny-by-default (`AUTHZ_CONTRACT`), verified parent-ward ownership, and server-enforced role privileges.
  - Admin functions (`school_admin`, `super_admin`) remain strictly web-based.

## Brand Commitments

- **Name**: Volpe V-Schools / School ERP Mobile (display name: "School ERP").
- **Design Tokens**: Standardized in `src/theme/theme.ts` (`VolpeTheme`), featuring Primary Brand Blue (`#1E6BFF`), Navy (`#0F172A`), category pastels (purple, green, orange, yellow, teal, pink, lime), and neutral surface tones (`#F8FAFC`, `#FFFFFF`).
- **Brand Assets**: Official assets located at `src/assets/volpe_logo.png` and `src/assets/volpe_bg.jpg`.

## Evidence on Hand

- Production API endpoint: `https://volpehub.in/api/v1`
- Production WebSocket endpoint: `wss://volpehub.in/ws/chat/`
- Implemented and verified native application codebase in `src/`.
- Fee payment processing currently tracks status and invoices via the API; payment gateway checkout handles or links to web payments.

## Product Principles

- **Role Isolation Over Clutter**: Each user role only sees what matters to their primary job; administrative functions are deliberately kept off mobile.
- **Frictionless Daily Rituals**: High-frequency actions (taking attendance, checking fees, sending a teacher message) must be completed in two taps or fewer.
- **Security & Trust at the Edge**: Strict session validation, mandatory initial password resets, and strict parent-to-ward authorization integrity.
- **Snappy Native Responsiveness**: Clean, modern pastel and blue design system with fast load times and reliable offline token caching.

## Accessibility & Inclusion

- Target WCAG AA color contrast ratios for all critical text and badges on light card backgrounds.
- Minimum 44x44 pt touch targets for mobile buttons, tabs, and interactive list rows.
- Full support for safe-area insets across iOS Dynamic Island / home indicators and Android system bars.
