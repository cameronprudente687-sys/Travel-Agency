"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { publishPortal, unpublishPortal, updatePortalMessage, createCustomerAccount } from "@/actions/portal"
import { ChecklistEditor } from "./ChecklistEditor"
import { Globe, GlobeLock, UserPlus, Copy, CheckCircle, User, Mail } from "lucide-react"
import { toast } from "sonner"

interface Props {
  portal: any
  leadId: string
  leadEmail: string
  leadFirstName: string
  customerAccount: { id: string; email: string; name: string; createdAt: string } | null
  checklistItems?: any[]
  checklistTemplates?: any[]
}

export function PortalControls({ portal, leadId, leadEmail, leadFirstName, customerAccount, checklistItems = [], checklistTemplates = [] }: Props) {
  const [isPending, startTransition] = useTransition()

  const handlePublish = () => {
    startTransition(async () => {
      try {
        await publishPortal(portal.id)
        toast.success("Portal published! Customer can now access their trip.")
      } catch { toast.error("Failed to publish") }
    })
  }

  const handleUnpublish = () => {
    if (!confirm("This will remove customer access to the portal. Continue?")) return
    startTransition(async () => {
      try {
        await unpublishPortal(portal.id)
        toast.success("Portal unpublished")
      } catch { toast.error("Failed to unpublish") }
    })
  }

  return (
    <div className="space-y-4">
      {/* Portal Status & Publish Controls */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Portal Status</h3>

        <div className="flex items-center gap-3 mb-4">
          <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${
            portal.portalStatus === "PUBLISHED" ? "bg-green-100 text-green-700" :
            portal.portalStatus === "UNPUBLISHED" ? "bg-red-100 text-red-700" :
            "bg-gray-100 text-gray-600"
          }`}>
            {portal.portalStatus === "PUBLISHED" ? <Globe className="w-3.5 h-3.5" /> : <GlobeLock className="w-3.5 h-3.5" />}
            {portal.portalStatus}
          </span>
          {portal.portalStatus === "PUBLISHED" && (
            <a href={`/portal/${portal.slug}`} target="_blank" className="text-xs text-primary-600 hover:underline">
              View public portal
            </a>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {portal.portalStatus !== "PUBLISHED" ? (
            <Button variant="navy" size="sm" onClick={handlePublish} disabled={isPending}>
              <Globe className="w-4 h-4 mr-1" /> Publish to Customer
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleUnpublish} disabled={isPending} className="text-red-600 border-red-200 hover:bg-red-50">
              <GlobeLock className="w-4 h-4 mr-1" /> Unpublish
            </Button>
          )}
        </div>
      </div>

      {/* Customer Access — the key new section */}
      <CustomerAccessSection
        leadId={leadId}
        leadEmail={leadEmail}
        leadFirstName={leadFirstName}
        customerAccount={customerAccount}
        portalPublished={portal.portalStatus === "PUBLISHED"}
      />

      {/* Advisor Message */}
      <AdvisorMessageEditor portalId={portal.id} currentMessage={portal.advisorMessage || ""} />

      {/* Checklist Editor */}
      <ChecklistEditor
        portalId={portal.id}
        items={checklistItems}
        checklistTemplates={checklistTemplates}
      />
    </div>
  )
}

// ==================== CUSTOMER ACCESS SECTION ====================

function CustomerAccessSection({
  leadId, leadEmail, leadFirstName, customerAccount, portalPublished,
}: {
  leadId: string
  leadEmail: string
  leadFirstName: string
  customerAccount: Props["customerAccount"]
  portalPublished: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const hasAccount = !!customerAccount

  const handleCreateAccount = () => {
    startTransition(async () => {
      try {
        const result = await createCustomerAccount(leadId) as any
        if (result.inviteToken) {
          setInviteToken(result.inviteToken)
          toast.success("Customer account created — setup link ready")
        }
      } catch (e: any) {
        toast.error(e.message || "Failed to create account")
      }
    })
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    toast.success(`${label} copied`)
    setTimeout(() => setCopied(null), 2000)
  }

  // Build the setup link
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const setupLink = inviteToken ? `${baseUrl}/welcome?token=${inviteToken}` : null

  // Build a message the advisor can send to the customer
  const portalMessage = setupLink
    ? `Hi ${leadFirstName}!\n\nYour personalized trip plan is ready to view. Click the link below to set your password and access your trip portal:\n\n${setupLink}\n\nOnce you've set your password, you can sign in anytime at ${baseUrl}/login to view your trip details, checklist, and more.\n\nLooking forward to making this trip incredible!\n\nWarm regards,\nYour Voyagr Advisor`
    : null

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Customer Access</h3>

      {!hasAccount && !inviteToken ? (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">No customer login yet</p>
              <p className="text-xs text-gray-400">Create a login so {leadFirstName} can view their trip portal.</p>
            </div>
          </div>
          {!portalPublished && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-3">
              Tip: Publish the portal first, then create the customer login.
            </p>
          )}
          <Button variant="navy" size="sm" onClick={handleCreateAccount} disabled={isPending}>
            <UserPlus className="w-4 h-4 mr-1" />
            {isPending ? "Creating..." : "Create Customer Login"}
          </Button>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                {inviteToken ? "Account created — send setup link" : "Customer login active"}
              </p>
              {customerAccount && (
                <p className="text-xs text-gray-400">
                  Created {new Date(customerAccount.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>

          {/* Setup link (shown right after account creation) */}
          {setupLink && (
            <div className="bg-gold-50 rounded-xl border border-gold-200 p-4 mb-4">
              <p className="text-sm font-medium text-gold-800 mb-2">Password Setup Link</p>
              <p className="text-xs text-gold-700 mb-3">Send this link to {leadFirstName}. They&apos;ll choose their own password.</p>
              <div className="flex items-center gap-2 bg-white rounded-lg border border-gold-200 px-3 py-2.5">
                <span className="text-sm text-gray-700 truncate flex-1 font-mono">{setupLink}</span>
                <button onClick={() => copyToClipboard(setupLink, "Link")} className="text-primary-600 hover:text-primary-800 shrink-0">
                  {copied === "Link" ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Ready-to-send message */}
          {portalMessage && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Message to Send</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(portalMessage, "Message")}
                  className="h-7 text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  {copied === "Message" ? "Copied!" : "Copy Message"}
                </Button>
              </div>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-white rounded-lg border border-gray-200 p-3 max-h-48 overflow-y-auto font-sans leading-relaxed">{portalMessage}</pre>
            </div>
          )}

          {/* Account info */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5">
            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-700">{customerAccount?.email || leadEmail}</span>
            <button onClick={() => copyToClipboard(customerAccount?.email || leadEmail, "Email")} className="text-primary-600 hover:text-primary-800 shrink-0 ml-auto">
              {copied === "Email" ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Resend setup link */}
          {hasAccount && !inviteToken && (
            <Button variant="outline" size="sm" className="mt-3" onClick={handleCreateAccount} disabled={isPending}>
              <UserPlus className="w-4 h-4 mr-1" />
              {isPending ? "Generating..." : "Generate New Setup Link"}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// ==================== ADVISOR MESSAGE ====================

function AdvisorMessageEditor({ portalId, currentMessage }: { portalId: string; currentMessage: string }) {
  const [msg, setMsg] = useState(currentMessage)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updatePortalMessage(portalId, msg)
      toast.success("Advisor message saved")
    } catch { toast.error("Failed to save") }
    finally { setSaving(false) }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <Label className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Advisor Message to Customer</Label>
      <Textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="A personal note to your client..." className="h-20 text-base mb-2" />
      <Button variant="navy" size="sm" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Message"}
      </Button>
    </div>
  )
}

