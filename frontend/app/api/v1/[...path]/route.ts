import { NextRequest } from "next/server";

export const runtime = "nodejs";

const METHODS_WITH_BODY = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function resolveBackendBaseUrl(): string {
  const defaultUrl = process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "http://insight-backend:10000";
  const raw = process.env.BACKEND_URL ?? defaultUrl;
  return raw.startsWith("http") ? raw : `http://${raw}`;
}

async function proxy(request: NextRequest, path: string[]): Promise<Response> {
  const backendBase = resolveBackendBaseUrl();
  const target = new URL(`${backendBase}/api/v1/${path.join("/")}`);
  target.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");

  let body: BodyInit | undefined;
  if (METHODS_WITH_BODY.has(request.method)) {
    const payload = await request.arrayBuffer();
    body = payload.byteLength > 0 ? Buffer.from(payload) : undefined;
  }

  const upstream = await fetch(target.toString(), {
    method: request.method,
    headers,
    body,
    redirect: "manual",
  });

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-length");

  return new Response(upstream.body, {
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
