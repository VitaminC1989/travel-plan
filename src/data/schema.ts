import { z } from "zod"

export const LocationSchema = z.object({
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  address: z.string().optional(),
})

export const CommentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  text: z.string(),
  timestamp: z.string(),
})

export const ActivitySchema = z.object({
  id: z.string(),
  type: z.enum(["activity", "ticket", "task"]),
  name: z.string(),
  details: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: LocationSchema.nullable().optional(),
  assigneeId: z.string().nullable(),
  budgetEstimate: z.number().min(0).optional(),
  status: z.enum(["planned", "confirmed", "completed", "cancelled"]).default("planned"),
  comments: z.array(CommentSchema),
})

export const DailyItinerarySchema = z.object({
  day: z.number(),
  date: z.string(),
  title: z.string(),
  notes: z.string().optional(),
  activities: z.array(ActivitySchema),
})

export const ExpenseSchema = z.object({
  id: z.string(),
  amount: z.number().min(0),
  category: z.enum(["transport", "accommodation", "food", "activities", "shopping", "other"]),
  description: z.string(),
  date: z.string(),
  paidBy: z.string().optional(),
  currency: z.string().optional(),
})

export const BudgetBreakdownSchema = z.object({
  transport: z.number().min(0),
  accommodation: z.number().min(0),
  food: z.number().min(0),
  activities: z.number().min(0),
  shopping: z.number().min(0).default(0),
  other: z.number().min(0).default(0),
})

export const BudgetSchema = z.object({
  total: z.number().min(0),
  currency: z.string().default("USD"),
  categories: BudgetBreakdownSchema,
})

export const ChecklistItemSchema = z.object({
  id: z.string(),
  item: z.string(),
  packed: z.boolean().optional(),
  completed: z.boolean().optional(),
  assigneeId: z.string().nullable().optional(),
})

export const ChecklistSchema = z.object({
  packing: z.array(ChecklistItemSchema),
  todos: z.array(ChecklistItemSchema),
})

export const ParticipantSchema = z.object({
  userId: z.string(),
  role: z.enum(["owner", "editor", "viewer"]),
  name: z.string().optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().optional(),
})

export const ShareLinkSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  permission: z.enum(["view", "edit"]),
  expiresAt: z.string().nullable(),
})

export const TripSchema = z.object({
  id: z.string(),
  name: z.string(),
  destination: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  ownerId: z.string(),
  participants: z.array(ParticipantSchema),
  budget: BudgetSchema,
  expenses: z.array(ExpenseSchema),
  itinerary: z.array(DailyItinerarySchema),
  checklists: ChecklistSchema,
  shareLinks: z.array(ShareLinkSchema).optional(),
  favoritePlaces: z.array(LocationSchema).optional(),
  templates: z.array(z.string()).optional(),
  lastUpdatedAt: z.string().optional(),
})

export type Trip = z.infer<typeof TripSchema>
export type DailyItinerary = z.infer<typeof DailyItinerarySchema>
export type Activity = z.infer<typeof ActivitySchema>
export type Expense = z.infer<typeof ExpenseSchema>
export type Checklist = z.infer<typeof ChecklistSchema>
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>
export type Participant = z.infer<typeof ParticipantSchema>
export type ShareLink = z.infer<typeof ShareLinkSchema>

export const TripFormSchema = TripSchema.partial({
  id: true,
  ownerId: true,
  shareLinks: true,
  favoritePlaces: true,
  templates: true,
  lastUpdatedAt: true,
}).extend({
  name: z.string().min(3, "行程名称至少 3 个字符"),
  destination: z.string().min(2, "目的地不能为空"),
  startDate: z.string(),
  endDate: z.string(),
})

export type TripFormValues = z.infer<typeof TripFormSchema>
