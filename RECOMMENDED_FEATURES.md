# Recommended Features (Next Iteration)

## 1. Real Search Experience
- Add search results UI under the search input (title, type, updated date).
- Add keyboard navigation (`up/down/enter`) and empty-state messaging.
- Add recent searches (local storage).

## 2. Full Canvas Productivity
- Add block connect mode (draw visual links between blocks).
- Add multi-select + group move/resize.
- Add undo/redo history stack.

## 3. Collaboration
- Add shareable canvas links with role-based access (`viewer`, `editor`).
- Add live cursors/presence for multi-user editing.
- Add comment threads on blocks.

## 4. Notes and Organization
- Implement tags API + tag management UI.
- Add folders/workspaces and favorites.
- Add pinned canvases on dashboard.

## 5. Uploads (Production-Safe)
- Move upload storage from local filesystem to cloud storage (S3/Vercel Blob).
- Add upload progress + file type/size validation in UI.
- Add attachment delete endpoint + cleanup job.

## 6. Security and Auth
- Add rate limiting on auth endpoints.
- Add email verification + password reset flow.
- Enforce stronger password policy and session hardening.

## 7. SaaS Billing Foundation
- Add plans (`Free`, `Pro`, `Team`) + usage limits.
- Integrate Stripe checkout and portal.
- Add feature gating middleware by plan.

## 8. Reliability / DevEx
- Add integration tests for auth + canvas APIs.
- Add e2e smoke tests for login -> dashboard -> canvas flow.
- Add structured logging and production error monitoring.

## Suggested Tomorrow Priority
1. Search results UI and keyboard navigation.
2. Tags API + tag list component integration.
3. Undo/redo in canvas.
4. Cloud upload migration.
