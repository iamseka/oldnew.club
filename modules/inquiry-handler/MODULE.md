# Inquiry Handler

The Inquiry Handler receives customer inquiries submitted through the site's contact form and routes notifications to Seka. There is no payment processing, no user accounts, and no inquiry data stored beyond what the form handling service retains.

## Interfaces

- **Inputs**: Form submissions from site visitors (name, email, message, product reference)
- **Outputs**: Email notification to inquire@oldnew.club

## Constraints

- Form handling service: TBD (Formspree, Netlify Forms, or serverless function -- decide and log in docs/decisions.md)
- No user data stored on our infrastructure
- No authentication or accounts
- Fallback: mailto:inquire@oldnew.club link if form service is unavailable
- Must validate required fields client-side before submission
- Spam prevention: TBD (honeypot field, rate limiting, or service-provided CAPTCHA)

## Data

No module-specific data. Inquiry data is handled entirely by the external form service.
