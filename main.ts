Deno.serve((req) => {
  let url = new URL(req.url);

  console.log(req.method + " " + url.pathname);

  if (req.method !== "GET") {
    return res.notallowed("Not allowed");
  }
  switch (url.pathname) {
    case "":
    case "/":
      // localStorage.clear();
      return res.html(Deno.readTextFileSync("home.html"));
    default:
      if (!url.pathname.startsWith("/img")) {
        return res.notfound("Not found");
      } else {
        return Image(url);
      }
  }
});

let res = {
  svg: init("image/svg+xml"),
  html: init("text/html"),
  notfound: init("text/plain", 404),
  notallowed: init("text/plain", 405),
};
function init(type: string, status = 200) {
  return (body: string) =>
    new Response(body, { status, headers: { "content-type": type } });
}

function Image({ pathname, searchParams }: URL) {
  let _count = localStorage.getItem(pathname);
  let count = _count ? parseInt(_count, 10) : 1;
  localStorage.setItem(pathname, String(count + 1));

  let template = searchParams.get("template") || "{n}";
  let text = template.replace("{n}", String(count));

  let size = searchParams.get("size") || "100";
  let width = searchParams.get("width") || searchParams.get("w") || size;
  let height = searchParams.get("height") || searchParams.get("h") || size;

  let fsize = searchParams.get("fsize") || "24";

  let bg = searchParams.get("bg") || "transparent";
  let fg = searchParams.get("fg") || "black";

  let img = Svg({ width, height, fsize, bg, fg, text });
  return res.svg(img);
}

type SvgProps = {
  width: string;
  height: string;
  fsize: string;
  bg: string;
  fg: string;
  text: string;
};

function Svg({
  width,
  height,
  fsize,
  bg,
  fg,
  text,
}: SvgProps): string {
  return /*svg*/ `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewbox="0 0 100 100"
      width="${width}"
      height="${height}"
      preserveAspectRatio="xMinYMin"
    >
      <rect width="100%" height="100%" fill="${bg}" />
      <text
        x="50%"
        y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        font-weight="bold"
        font-family="sans-serif"
        font-size="${fsize}"
        fill="${fg}"
      >
        ${text}
      </text>
    </svg>
  `.trim();
}
