export default {
  async fetch(request) {
    return new Response('ハローワールド', {
      headers: { 'content-type': 'text/plain' },
    });
  },
};
