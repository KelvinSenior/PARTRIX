"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, Copy } from "lucide-react";
import { appBtnPrimary, appBtnSecondary, appCardInner, appInput } from "@/lib/appStyles";

type MemberRole = "ADMIN" | "MANAGER" | "STAFF";
type InviteRole = "MANAGER" | "STAFF";

type TeamMember = {
  id: string;
  name: string | null;
  email: string;
  role: MemberRole;
  status: string;
  createdAt: string;
};

type TeamInvitation = {
  id: string;
  email: string;
  role: InviteRole;
  status: string;
  createdAt: string;
  expiresAt: string;
};

export default function TeamMembersPanel({ canManageMembers }: { canManageMembers: boolean }) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteRole>("STAFF");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copiedInviteLink, setCopiedInviteLink] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadTeamData() {
    setLoading(true);
    setError(null);
    try {
      const [membersResponse, invitationsResponse] = await Promise.all([
        fetch("/api/organization/members"),
        fetch("/api/organization/invitations"),
      ]);

      const membersPayload = await membersResponse.json().catch(() => null);
      const invitationsPayload = await invitationsResponse.json().catch(() => null);

      if (!membersResponse.ok || !invitationsResponse.ok) {
        throw new Error(
          membersPayload?.message || invitationsPayload?.message || "Unable to load team data.",
        );
      }

      setMembers(Array.isArray(membersPayload?.members) ? membersPayload.members : []);
      setInvitations(Array.isArray(invitationsPayload?.invitations) ? invitationsPayload.invitations : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load team data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!canManageMembers) {
      setLoading(false);
      return;
    }

    void loadTeamData();
  }, [canManageMembers]);

  async function submitInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!inviteEmail.trim()) {
      setError("Enter the team member’s email address.");
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);
    setInviteLink(null);
    setCopiedInviteLink(false);

    try {
      const response = await fetch("/api/organization/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || "Unable to send invitation.");
      }

      const inviteLink = payload?.invitation?.inviteUrl
        ? `${window.location.origin}${payload.invitation.inviteUrl}`
        : null;

      setInviteEmail("");
      setInviteRole("STAFF");
      setInviteLink(inviteLink);
      setCopiedInviteLink(false);
      setNotice("Invitation created. Share the invite link with your teammate.");
      await loadTeamData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to send invitation.");
    } finally {
      setBusy(false);
    }
  }

  async function copyInviteLink() {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedInviteLink(true);
    } catch {
      setError("Unable to copy the invitation link. Select and copy it instead.");
    }
  }

  async function updateRole(memberId: string, role: MemberRole) {
    setError(null);
    setNotice(null);
    setActionBusy(`role:${memberId}`);

    try {
      const response = await fetch(`/api/organization/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || "Unable to update member role.");
      }

      setMembers((current) =>
        current.map((member) => (member.id === memberId ? { ...member, role } : member)),
      );
      setNotice("Member role updated.");
    } catch (roleError) {
      setError(roleError instanceof Error ? roleError.message : "Unable to update member role.");
    } finally {
      setActionBusy(null);
    }
  }

  async function removeMember(memberId: string) {
    const member = members.find((current) => current.id === memberId);
    if (!window.confirm(`Remove ${member?.name || member?.email || "this member"} from the workspace?`)) return;

    setError(null);
    setNotice(null);
    setActionBusy(`remove:${memberId}`);

    try {
      const response = await fetch(`/api/organization/members/${memberId}`, { method: "DELETE" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || "Unable to remove member.");
      }

      setMembers((current) => current.filter((member) => member.id !== memberId));
      setNotice("Member removed from the workspace.");
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Unable to remove member.");
    } finally {
      setActionBusy(null);
    }
  }

  async function revokeInvitation(invitationId: string) {
    const invitation = invitations.find((current) => current.id === invitationId);
    if (!window.confirm(`Revoke the invitation for ${invitation?.email || "this teammate"}?`)) return;

    setError(null);
    setNotice(null);
    setActionBusy(`revoke:${invitationId}`);

    try {
      const response = await fetch(`/api/organization/invitations/${invitationId}`, { method: "DELETE" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || "Unable to revoke invitation.");
      }

      setInvitations((current) => current.filter((invitation) => invitation.id !== invitationId));
      setNotice("Invitation revoked.");
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : "Unable to revoke invitation.");
    } finally {
      setActionBusy(null);
    }
  }

  if (!canManageMembers) {
    return (
      <div className={`${appCardInner} mt-6`}>
        <p className="text-sm text-slate-600 dark:text-zinc-300">
          Only workspace administrators can manage team members and invitations.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <div className={`${appCardInner}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200/80">
              Team access
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Invite a teammate</h3>
          </div>
        </div>

        <form onSubmit={submitInvite} className="mt-4 grid gap-3 md:grid-cols-[1.4fr_0.8fr_auto]">
          <input
            type="email"
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            placeholder="teammate@company.com"
            className={appInput}
            aria-label="Team member email"
          />

          <select
            value={inviteRole}
            onChange={(event) => setInviteRole(event.target.value as InviteRole)}
            className={appInput}
            aria-label="Team member role"
          >
            <option value="STAFF">Staff</option>
            <option value="MANAGER">Manager</option>
          </select>

          <button type="submit" disabled={busy} className={appBtnPrimary}>
            {busy ? "Sending..." : "Send invite"}
          </button>
        </form>
      </div>

      {inviteLink ? (
        <div className="rounded-xl border border-cyan-300/50 bg-cyan-50 p-4 dark:border-cyan-300/30 dark:bg-cyan-500/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-cyan-950 dark:text-cyan-100">Invite link ready</p>
              <a href={inviteLink} className="mt-1 block break-all text-sm text-cyan-800 underline underline-offset-2 dark:text-cyan-200">
                {inviteLink}
              </a>
            </div>
            <button
              type="button"
              onClick={() => void copyInviteLink()}
              className={appBtnSecondary + " shrink-0"}
              aria-label={copiedInviteLink ? "Invitation link copied" : "Copy invitation link"}
            >
              {copiedInviteLink ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              {copiedInviteLink ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>
      ) : null}

      {(error || notice) ? (
        <div
          role={error ? "alert" : "status"}
          aria-live={error ? "assertive" : "polite"}
          className={`rounded-xl border px-4 py-3 text-sm ${error ? "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200" : "border-cyan-300 bg-cyan-50 text-cyan-900 dark:border-cyan-300/30 dark:bg-cyan-500/10 dark:text-cyan-100"}`}
        >
          {error || notice}
        </div>
      ) : null}

      <div className={`${appCardInner}`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Current team</h3>
          {!loading ? <span className="text-sm text-slate-500 dark:text-zinc-400">{members.length} {members.length === 1 ? "member" : "members"}</span> : null}
        </div>

        {loading ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-zinc-400">Loading team members...</p>
        ) : members.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-zinc-400">No team members yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-slate-900/40 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white">{member.name || "Unnamed member"}</p>
                  <p className="text-sm text-slate-500 dark:text-zinc-400">{member.email}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                    Joined {new Date(member.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {member.role === "ADMIN" ? (
                    <span className="rounded-full border border-amber-300 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-200">
                      Owner
                    </span>
                  ) : (
                    <select
                      value={member.role}
                      onChange={(event) => updateRole(member.id, event.target.value as MemberRole)}
                      className={appInput + " w-[140px]"}
                      aria-label={`Role for ${member.name || member.email}`}
                      disabled={actionBusy !== null}
                    >
                      <option value="MANAGER">Manager</option>
                      <option value="STAFF">Staff</option>
                    </select>
                  )}

                  {member.role !== "ADMIN" ? (
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className={appBtnSecondary + " border-rose-300 text-rose-600 dark:border-rose-400/20 dark:text-rose-200"}
                      disabled={actionBusy !== null}
                    >
                      {actionBusy === `remove:${member.id}` ? "Removing..." : "Remove"}
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`${appCardInner}`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Pending invites</h3>
          {!loading ? <span className="text-sm text-slate-500 dark:text-zinc-400">{invitations.length} open</span> : null}
        </div>

        {loading ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-zinc-400">Checking open invites...</p>
        ) : invitations.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-zinc-400">No pending invitations.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-slate-900/40 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{invitation.email}</p>
                  <p className="text-sm text-slate-500 dark:text-zinc-400">
                    {invitation.role === "MANAGER" ? "Manager" : "Staff"} · Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => revokeInvitation(invitation.id)}
                  className={appBtnSecondary + " border-rose-300 text-rose-600 dark:border-rose-400/20 dark:text-rose-200"}
                  disabled={actionBusy !== null}
                >
                  {actionBusy === `revoke:${invitation.id}` ? "Revoking..." : "Revoke"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
