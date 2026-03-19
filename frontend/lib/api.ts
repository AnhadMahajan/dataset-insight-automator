import { JobDetail, JobListResponse, UploadResponse } from "@/lib/types";

function parseApiError(errorBody: string): string {
  if (!errorBody) {
    return "Unexpected API error.";
  }

  try {
    const parsed = JSON.parse(errorBody) as {
      detail?: unknown;
      message?: unknown;
      error?: unknown;
    };

    for (const candidate of [parsed.detail, parsed.message, parsed.error]) {
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate;
      }
    }
  } catch {
    // If body is plain text or HTML, fall back to raw text.
  }

  return errorBody;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...options,
      cache: "no-store"
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown network error.";
    throw new Error(
      `Network request failed (${path}): ${detail}. If this was an upload, check History because the job may still have been accepted.`
    );
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(parseApiError(errorBody));
  }

  return response.json() as Promise<T>;
}

export async function uploadDataset(file: File, email: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("email", email.trim());

  return request<UploadResponse>("/api/v1/upload", {
    method: "POST",
    body: formData
  });
}

export async function fetchJob(jobId: string): Promise<JobDetail> {
  return request<JobDetail>(`/api/v1/job/${jobId}`);
}

export async function fetchJobs(limit = 50): Promise<JobListResponse> {
  return request<JobListResponse>(`/api/v1/jobs?limit=${limit}`);
}
