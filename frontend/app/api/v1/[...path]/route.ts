import { NextRequest } from "next/server";

export const runtime = "nodejs";

const METHODS_WITH_BODY = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function stripHopByHopHeaders(headers: Headers): void {
  for (const header of HOP_BY_HOP_HEADERS) {
    headers.delete(header);
  }
}

function resolveBackendBaseUrl(): string {
  const defaultUrl = process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "";
  const raw = process.env.BACKEND_URL ?? defaultUrl;
  if (!raw) {
    throw new Error("BACKEND_URL is not configured for the frontend service.");
  }
  return raw.startsWith("http") ? raw : `http://${raw}`;
}

async function proxy(request: NextRequest, path: string[]): Promise<Response> {
  let backendBase = "";
  try {
    backendBase = resolveBackendBaseUrl();
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Proxy configuration error.";
    return Response.json({ detail }, { status: 500 });
  }

  const target = new URL(`${backendBase}/api/v1/${path.join("/")}`);
  target.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("accept-encoding");
  stripHopByHopHeaders(headers);

  let body: BodyInit | undefined;
  if (METHODS_WITH_BODY.has(request.method)) {
    const payload = await request.arrayBuffer();
    body = payload.byteLength > 0 ? Buffer.from(payload) : undefined;
  }

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), {
      method: request.method,
      headers,
      body,
      redirect: "manual",
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Failed to reach backend service.";
    return Response.json(
      { detail: `Failed to reach backend at ${backendBase}. ${detail}` },
      { status: 502 },
    );
  }

  let upstreamBody: ArrayBuffer;
  try {
    upstreamBody = await upstream.arrayBuffer();
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Failed to read backend response body.";
    return Response.json(
      { detail: `Backend responded but proxy could not read the response. ${detail}` },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-length");
  responseHeaders.delete("content-encoding");
  stripHopByHopHeaders(responseHeaders);

  return new Response(upstreamBody, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

type RouteContext = {
  params: {
    path: string[];
  };
};

export async function GET(request: NextRequest, context: RouteContext): Promise<Response> {
  return proxy(request, context.params.path);
}

export async function POST(request: NextRequest, context: RouteContext): Promise<Response> {
  return proxy(request, context.params.path);
}

export async function PUT(request: NextRequest, context: RouteContext): Promise<Response> {
  return proxy(request, context.params.path);
}

export async function PATCH(request: NextRequest, context: RouteContext): Promise<Response> {
  return proxy(request, context.params.path);
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<Response> {
  return proxy(request, context.params.path);
}

export async function OPTIONS(request: NextRequest, context: RouteContext): Promise<Response> {
  return proxy(request, context.params.path);
}
