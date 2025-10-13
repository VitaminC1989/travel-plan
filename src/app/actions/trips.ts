'use server'

import { revalidatePath } from "next/cache"

import { TripFormSchema, type TripFormValues } from "@/data/schema"
import { removeTrip, upsertTrip } from "@/lib/db"

export async function saveTripAction(values: TripFormValues) {
  const payload = TripFormSchema.parse(values)
  const trip = await upsertTrip(payload)

  revalidatePath("/")
  revalidatePath("/calendar")
  revalidatePath(`/trips/${trip.id}`)

  return trip
}

export async function deleteTripAction(tripId: string) {
  const success = await removeTrip(tripId)

  if (success) {
    revalidatePath("/")
    revalidatePath("/calendar")
  }

  return success
}
