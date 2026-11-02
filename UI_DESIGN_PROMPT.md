# BillionDue UI Design Prompt

Design a polished, production-ready interface for **BillionDue**, an invoicing and license-management product with the tagline **“Turn invoices into income.”** The product has three connected surfaces: an Owner Admin web portal, a company-scoped Client web portal, and a Windows desktop invoicing app. Keep the experience practical and credible for small business teams and the people who administer their software licenses.

## Visual direction

Use the supplied soft mint palette as the visual foundation:

- `#ECFAE5` — pale mint page accents and quiet highlights
- `#DDF6D2` — selected navigation, subtle card fills, and soft controls
- `#CAE8BD` — borders, dividers, and secondary emphasis
- `#B0DB9C` — primary mint accent for active states and restrained highlights

Pair the mint colors with warm white surfaces, deep forest green for high-contrast primary actions and headings, and calm charcoal body text. Preserve accessible contrast, especially for small labels, disabled controls, and status badges. Use red and amber only to communicate actual errors, blocked licenses, overdue invoices, or pending attention. Avoid turning every panel green. The overall impression should be clear, dependable, calm, and human: a thoughtfully crafted business tool rather than a generic admin template.

Use a consistent, legible sans-serif type system, generous but efficient spacing, subtle borders, moderate corner radii, and restrained shadows. Use familiar line icons consistently. Build responsive layouts that remain usable on a laptop and smaller screens, and retain a Windows desktop feel in the invoicing app.

## Product surfaces

### Owner Admin web portal

Create an administrator sign-in screen and a secure portal for managing the software service. The navigation should make these real work areas easy to find: Overview, Companies, Client approval requests, Client login devices, Templates, Guest access, and Settings. The Overview should summarize current company, license, device, and request activity from live records. Company management should show useful details such as company identity, contact, plan, license status and expiry, seats, and registered devices. Make actions like approving a request, blocking or reactivating a company, and reviewing a device clear and deliberate, with a confirmation step for consequential changes.

### Client web portal

Provide a separate client sign-in and a company-scoped experience. After sign-in, clients should only see their own company’s license and device status, assigned invoice templates, and relevant support or replacement requests. Use plain-language status explanations and show clear next steps when a license is near expiry, a device needs approval, or a request is pending. Do not expose Owner Admin navigation or other companies’ records.

### Windows desktop invoicing app

Design a focused daily-work interface for creating and tracking invoices. Include a dashboard, invoice list and editor, customers, products, payments, reports, and settings. The invoice editor should make customer selection, line items, dates, totals, notes, preview, and export actions easy to scan. Include calm, clearly differentiated states for draft, sent, paid, overdue, cancelled, offline, and license-locked conditions. First-run activation should guide an approved user through credentials, email code, installation key, and device verification. Offer the time-limited Guest option with its limit explained before starting.

## Content and data rules

Write natural, concise interface copy as if it came from a product team that understands invoicing and license administration. Use direct, specific labels and helpful explanations; avoid lorem ipsum, vague filler, canned marketing claims, and robotic wording. Examples of the tone: “No companies have been added yet,” “This device is waiting for approval,” and “Your license renews in 2 days.”

Use no invented customer names, invoices, amounts, license records, activity, or dashboard metrics. Screens should render only data returned by the connected database/API. When a list is empty, explain what belongs there and give the appropriate next action. Use realistic content only in explicitly marked design examples, never as default product data.

## Interaction and accessibility

Show loading, empty, success, validation-error, offline, pending-approval, blocked, and expired states. Keep page navigation and browser refresh behavior predictable. Use visible keyboard focus, meaningful field labels, readable status text in addition to color, and buttons with clear action names. Destructive or security-sensitive actions need confirmation and a concise explanation of their effect.

The finished design should feel like one coherent BillionDue product across web and desktop, while making each user’s permissions and current task immediately obvious.
