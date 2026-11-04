export default {
  fetch(request) {
    const target = new URL(request.url);
    target.protocol = "https:";
    target.hostname = "neoomsi.com";
    target.port = "";
    return Response.redirect(target, 301);
  },
};
