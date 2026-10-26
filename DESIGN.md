# Thinkora AI Design System

## Direction
Create a calm, focused chat workspace with restrained surfaces and clear hierarchy. No Google Stitch reference was available during initial inspection; this is the documented baseline and should be reconciled if a reference is later supplied.

## Tokens
- Neutral base: warm near-white `#FAFAF8`, white surface, charcoal text `#202124`, muted gray `#71717A`, subtle border `#E5E5E3`.
- Accent: deep indigo `#4F46E5`; hover `#4338CA`; focus ring with visible contrast.
- Dark theme: `#111113` canvas, `#1B1B1F` surface, `#F4F4F5` text, `#A1A1AA` muted, `#303036` border, lighter indigo accent.
- Typography: system sans stack; 14–16px interface text, 15–17px chat body, 12–13px metadata; comfortable 1.55 body line height.
- Spacing: 4px base; common increments 8, 12, 16, 24, 32. Rounded controls 8–12px, cards 12px.

## Layout and components
- Desktop: full-height application; collapsible 260px conversation sidebar and flexible centered transcript column (max width about 820px); composer anchored below transcript.
- Mobile: one-column chat, sidebar becomes an accessible drawer, composer respects safe-area insets, no horizontal overflow.
- Shared pieces: app shell, sidebar, conversation row, header/actions, message bubble/role label, markdown body, composer, auth form, settings panel, dialogs, toast messages, skeleton and empty/error states.
- Use shadcn/ui conventions and Lucide icons; use native semantic elements and consistent focus treatment.

## Interaction and accessibility
Keyboard-accessible navigation, form labels, dialog focus management, visible focus, sufficient contrast, reduced-motion support, status announcements for stream lifecycle, and touch targets around 44px. Submit with Enter and insert newline with Shift+Enter. Stop remains available during generation. Destructive delete is confirmed. Theme choice persists locally.

## Page requirements
- `/`: redirect authenticated users to chat and visitors to sign-in.
- `/sign-in`, `/sign-up`: email/password and configured OAuth choices with pending and error states.
- `/chat` and `/chat/[id]`: empty/new chat, history, streamed generation, composer, sidebar actions, responsive navigation.
- `/settings`: theme and account/sign-out controls.

## Motion and feedback
Use brief opacity/color transitions, no essential information conveyed by animation. Sonner toasts report operation outcomes; inline states explain loading, empty, provider failure, and retry.
