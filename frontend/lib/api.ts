import { JobDetail, JobListResponse, UploadResponse } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    cache: "no-store"
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || "Unexpected API error.");
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
