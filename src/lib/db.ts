import { randomUUID } from "node:crypto"
import { cache } from "react"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import { mockTrips } from "@/data/mock-data"
import { TripSchema, type Trip, type TripFormValues } from "@/data/schema"

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? ""
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  ""

let client: SupabaseClient | null = null

const ensureClient = () => {
  if (!client && supabaseUrl && supabaseKey) {
    client = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })
  }

  return client
}

const parseTrips = (payload: unknown[]): Trip[] => {
  return payload
    .map((item) => {
      try {
        return TripSchema.parse(item)
      } catch (error) {
        console.warn("Trip payload validation failed", error)
        return null
      }
    })
    .filter(Boolean) as Trip[]
}

export const fetchTrips = cache(async (): Promise<Trip[]> => {
  const supabase = ensureClient()

  if (!supabase) {
    return mockTrips
  }

  try {
    const { data, error } = await supabase.from("trips").select("*")

    if (error || !data) {
      console.error("Failed to fetch trips from Supabase", error)
      return mockTrips
    }

    return parseTrips(data)
  } catch (error) {
    console.error("Unexpected error while fetching trips", error)
    return mockTrips
  }
})

export const fetchTripById = cache(async (tripId: string): Promise<Trip | null> => {
  const supabase = ensureClient()

  if (!supabase) {
    return mockTrips.find((trip) => trip.id === tripId) ?? null
  }

  try {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .single()

    if (error || !data) {
      console.error("Trip lookup failed", error)
      return mockTrips.find((trip) => trip.id === tripId) ?? null
    }

    return TripSchema.parse(data)
  } catch (error) {
    console.error("Unexpected error while fetching trip", error)
    return mockTrips.find((trip) => trip.id === tripId) ?? null
  }
})

export const upsertTrip = async (payload: TripFormValues): Promise<Trip> => {
  const supabase = ensureClient()
  const nextTrip: Trip = TripSchema.parse({
    ...payload,
    id: payload.id ?? randomUUID(),
    ownerId: payload.ownerId ?? "user-1",
    participants: payload.participants ?? [],
    budget: payload.budget ?? {
      total: 0,
      currency: "USD",
      categories: {
        transport: 0,
        accommodation: 0,
        food: 0,
        activities: 0,
        shopping: 0,
        other: 0,
      },
    },
    expenses: payload.expenses ?? [],
    itinerary: payload.itinerary ?? [],
    checklists: payload.checklists ?? { packing: [], todos: [] },
    shareLinks: payload.shareLinks ?? [],
    favoritePlaces: payload.favoritePlaces ?? [],
    templates: payload.templates ?? [],
    lastUpdatedAt: new Date().toISOString(),
  })

  if (!supabase) {
    return nextTrip
  }

  try {
    const { data, error } = await supabase.from("trips").upsert(nextTrip).select().single()

    if (error || !data) {
      console.error("Failed to upsert trip", error)
      return nextTrip
    }

    return TripSchema.parse(data)
  } catch (error) {
    console.error("Unexpected error while upserting trip", error)
    return nextTrip
  }
}

export const removeTrip = async (tripId: string): Promise<boolean> => {
  const supabase = ensureClient()

  if (!supabase) {
    return true
  }

  try {
    const { error } = await supabase.from("trips").delete().eq("id", tripId)

    if (error) {
      console.error("Failed to delete trip", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Unexpected error while deleting trip", error)
    return false
  }
}
