export type Plan = 'free' | 'pro'

export type MemberRole = 'admin' | 'member'

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'customer'

export type DealStage =
  | 'new_lead'
  | 'contacted'
  | 'proposal_sent'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost'

export type ActivityType = 'call' | 'email' | 'meeting' | 'note'

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'

export interface Workspace {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface WorkspaceMember {
  workspace_id: string
  user_id: string
  role: MemberRole
  created_at: string
}

export interface Lead {
  id: string
  workspace_id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  position: string | null
  status: LeadStatus
  owner_id: string | null
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  workspace_id: string
  lead_id: string
  title: string
  value: number
  stage: DealStage
  owner_id: string | null
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  lead_id: string
  workspace_id: string
  type: ActivityType
  description: string
  created_by: string
  created_at: string
}

export interface Subscription {
  workspace_id: string
  plan: Plan
  status: SubscriptionStatus
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}
