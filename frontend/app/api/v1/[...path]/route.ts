import { NextRequest } from "next/server";

export const runtime = "nodejs";

const METHODS_WITH_BODY = new Set(["POST", "PUT", "PATCH", "DELETE"]);

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
