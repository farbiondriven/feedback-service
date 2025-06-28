export interface FeedbackResponse {
  id: number;
}
export interface FeedbackRecord {
  id: number;
  content: string;
  sentiment: 'GOOD' | 'NEUTRAL' | 'BAD' | 'UNDETERMINED';
  createdAt: string;
}

export async function submitFeedback(
  content: string,
): Promise<FeedbackResponse> {
  const res = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || `Error ${res.status}`);
  }
  return res.json();
}

export async function fetchFeedbacks(token: string): Promise<FeedbackRecord[]> {
  const res = await fetch('/api/admin/feedback', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || `Error ${res.status}`);
  }
  return res.json();
}
