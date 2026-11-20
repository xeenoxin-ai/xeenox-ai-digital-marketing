// intimacycouple.pages.dev: forwards every request (pages, API, WebSockets) to the
// "intimacycouple" Worker, which serves the website and runs the backend.
export default {
  fetch(request, env) {
    return env.BACKEND.fetch(request);
  },
};
