import { api } from "../client";
import { Endpoints } from "../endpoints";

export async function releaseIssuePayout(issueId: number): Promise<void> {
  await api.post(Endpoints.ISSUE_RELEASE(issueId));
}

export async function refundIssuePatient(issueId: number): Promise<void> {
  await api.post(Endpoints.ISSUE_REFUND(issueId));
}