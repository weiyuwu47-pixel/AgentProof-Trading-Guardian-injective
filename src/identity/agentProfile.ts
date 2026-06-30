import path from "node:path";
import { hashStableJson } from "../proof/hash.js";
import { latestJsonFile, readJsonFile } from "../utils/fs.js";

export interface AgentIdentityProfile {
  agentProfileId: string;
  agentName: string;
  agentType: string;
  chain: string;
  version: string;
  ownerAddress: string;
  capabilities: string[];
  authorizedInputs: string[];
  forbiddenInputs: string[];
  serviceEndpoints: {
    demo: string;
    proofMetadata: string;
  };
  createdAt: string;
}

export interface AgentProfileAnchor {
  type: "AgentProfileAnchor";
  agentProfileId: string;
  agentProfileHash: string;
  memo: string;
  chain: string;
  provider: string;
  txHash: string;
  explorerUrl?: string;
  timestamp: string;
}

export interface AgentIdentitySummary {
  agentProfileId: string;
  agentProfileHash: string;
  profileAnchorTxHash?: string;
  profileAnchorMemo?: string;
  chain: string;
}

export async function loadAgentIdentityProfile(
  filePath = path.join(process.cwd(), "data", "agent", "agent-profile.json")
): Promise<AgentIdentityProfile> {
  const profile = await readJsonFile<AgentIdentityProfile>(filePath);
  const ownerAddress = process.env.INJECTIVE_ADDRESS?.trim();

  return {
    ...profile,
    ownerAddress: ownerAddress || profile.ownerAddress
  };
}

export function hashAgentIdentityProfile(profile: AgentIdentityProfile): string {
  return hashStableJson(profile);
}

export function buildAgentProfileMemo(agentProfileId: string, agentProfileHash: string): string {
  return `AgentProfile:${agentProfileId}:${agentProfileHash}`;
}

export async function loadLatestAgentProfileAnchor(): Promise<AgentProfileAnchor | undefined> {
  try {
    const filePath = await latestJsonFile(path.join(process.cwd(), "reports"), "agent-profile-anchor-");
    return await readJsonFile<AgentProfileAnchor>(filePath);
  } catch {
    return undefined;
  }
}

export function createAgentIdentitySummary(params: {
  profile: AgentIdentityProfile;
  agentProfileHash: string;
  anchor?: AgentProfileAnchor;
}): AgentIdentitySummary {
  return {
    agentProfileId: params.profile.agentProfileId,
    agentProfileHash: params.agentProfileHash,
    profileAnchorTxHash: params.anchor?.txHash,
    profileAnchorMemo: params.anchor?.memo,
    chain: params.anchor?.chain ?? params.profile.chain
  };
}
