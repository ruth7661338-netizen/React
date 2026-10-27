# Deployment Plan

- [x] Commit API fixes and Render Blueprint (`fe8392f`).
- [x] Push the commit to `origin/main`.
- [ ] Create the Render service from `render.yaml` and configure `MONGO_URI`, `TEACHER_CODE`, and `CLIENT_URL`.
- [ ] Deploy and verify `GET /api/health` returns `200` with `{ "ok": true }`.
- [ ] Add and deploy the frontend separately; it is not included in this repository.