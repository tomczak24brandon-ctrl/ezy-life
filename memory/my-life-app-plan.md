# "My Life" App — Build Plan
_Last updated: 2026-07-06_

## Overview
A personal/family management platform for Brandon & wife.
App name: **My Life**
Hosting: Netlify (frontend) + Firebase (backend/auth/realtime)

## Users
- Brandon Tomczak — main user
- Nicole (wife) — separate login

## 3-Tab Structure

### Tab 1: Personal
- Trading journal (stocks & ETFs only)
- Accounts: Beta Core, Alpha Strike, TARGET DATE 2060
- Log Buys: ticker, account, date, shares, price, thesis, valuation/target price, hold duration
- Log Sells: links to original buy, auto-calc gain/loss, LT vs ST, est. tax (MFJ)
- Capital gains tax calc (Married Filing Jointly 2025 brackets)
- Import from existing Google Sheets spreadsheet (CSV)
- Kids' accounts: TBD (same app or separate — ask)
- Monday noon CT reminder → transfer capital gains tax to Schwab tax account

### Tab 2: Business
- Iron Eagle Truck Center tasks
- Invoices
- eBay listings tracker
- General business to-dos
- Items that need action auto-push to the calendar

### Tab 3: To-Do / Calendar
- Google Calendar-style UI (month/week/day views)
- Tasks auto-pushed from Personal and Business tabs
- Shared with wife (both can see/add/edit events)
- Assign events to: Brandon only / Wife only / Both
- Daily 8am CT brief → uncompleted tasks pushed to Telegram

## Tech Stack
- Frontend: HTML/CSS/JS (or React if needed)
- Backend: Firebase (Firestore + Auth)
- Auth: Email/password login per user
- Hosting: Netlify
- Realtime sync for shared calendar

## Reminders (already set in cron)
- Monday 12:00pm CT — capital gains tax transfer reminder
- Daily 8:00am CT — morning brief for uncompleted tasks

## Build Session
- Scheduled: Sunday night
- Brandon will bring: spreadsheet CSV export for import

## Open Questions
1. Kids' accounts — same app under Personal, or separate section?
