import { addDays, formatISO } from "date-fns"
import { v4 as uuid } from "uuid"

import type { Trip } from "./schema"

const today = new Date()

const createTrip = (overrides: Partial<Trip>): Trip => {
  const id = overrides.id ?? uuid()
  const startDate = overrides.startDate ?? formatISO(addDays(today, 14), { representation: "date" })
  const endDate = overrides.endDate ?? formatISO(addDays(today, 21), { representation: "date" })

  return {
    id,
    name: "行程名称",
    destination: "未知目的地",
    ownerId: "user-1",
    participants: [
      {
        userId: "user-1",
        role: "owner",
        name: "Alex",
        email: "alex@example.com",
        avatarUrl: "https://avatars.dicebear.com/api/initials/A.svg",
      },
      {
        userId: "user-2",
        role: "editor",
        name: "Jamie",
        email: "jamie@example.com",
        avatarUrl: "https://avatars.dicebear.com/api/initials/J.svg",
      },
    ],
    budget: {
      total: 5000,
      currency: "EUR",
      categories: {
        transport: 1200,
        accommodation: 2000,
        food: 800,
        activities: 1000,
        shopping: 200,
        other: 200,
      },
    },
    expenses: [
      {
        id: uuid(),
        amount: 850,
        category: "transport",
        description: "往返机票",
        date: formatISO(addDays(today, 7), { representation: "date" }),
        paidBy: "user-1",
        currency: "EUR",
      },
      {
        id: uuid(),
        amount: 320,
        category: "accommodation",
        description: "巴黎酒店订金",
        date: formatISO(addDays(today, 10), { representation: "date" }),
        paidBy: "user-2",
        currency: "EUR",
      },
    ],
    itinerary: [
      {
        day: 1,
        date: startDate,
        title: "抵达与入住",
        notes: "留出充足时间办理入住",
        activities: [
          {
            id: uuid(),
            type: "ticket",
            name: "机票",
            details: "航班号 LH457, 10:30 起飞",
            startTime: "10:30",
            endTime: "15:30",
            location: {
              name: "戴高乐机场",
              lat: 49.0097,
              lng: 2.5479,
            },
            assigneeId: "user-1",
            budgetEstimate: 900,
            status: "confirmed",
            comments: [],
          },
          {
            id: uuid(),
            type: "activity",
            name: "入住酒店",
            details: "Hotel Le Ritz",
            startTime: "17:00",
            location: {
              name: "Hotel Le Ritz",
              lat: 48.8698,
              lng: 2.3285,
              address: "15 Place Vendôme, 75001 Paris",
            },
            assigneeId: null,
            budgetEstimate: 400,
            status: "planned",
            comments: [
              {
                id: uuid(),
                userId: "user-2",
                text: "这家酒店靠近卢浮宫！",
                timestamp: new Date().toISOString(),
              },
            ],
          },
        ],
      },
      {
        day: 2,
        date: formatISO(addDays(new Date(startDate), 1), { representation: "date" }),
        title: "探索巴黎经典",
        activities: [
          {
            id: uuid(),
            type: "activity",
            name: "卢浮宫导览",
            details: "预约 10:00 中文讲解",
            startTime: "10:00",
            endTime: "13:00",
            location: {
              name: "卢浮宫艺术博物馆",
              lat: 48.8606,
              lng: 2.3376,
            },
            assigneeId: "user-2",
            budgetEstimate: 120,
            status: "planned",
            comments: [],
          },
          {
            id: uuid(),
            type: "task",
            name: "预订塞纳河游船",
            details: "Jamie 负责在 18:00 场次之前完成预订",
            assigneeId: "user-2",
            status: "planned",
            comments: [],
          },
        ],
      },
    ],
    checklists: {
      packing: [
        { id: uuid(), item: "护照", packed: true },
        { id: uuid(), item: "充电器", packed: false },
        { id: uuid(), item: "欧洲转换插头", packed: false },
      ],
      todos: [
        { id: uuid(), item: "购买保险", completed: false },
        { id: uuid(), item: "确认航班座位", completed: true },
      ],
    },
    favoritePlaces: [
      {
        name: "埃菲尔铁塔",
        lat: 48.8584,
        lng: 2.2945,
      },
      {
        name: "圣心大教堂",
        lat: 48.8867,
        lng: 2.3431,
      },
    ],
    templates: ["巴黎浪漫三日", "欧洲城市快闪"],
    shareLinks: [
      {
        id: uuid(),
        url: `https://travel.example.com/share/${id}`,
        permission: "edit",
        expiresAt: null,
      },
    ],
    lastUpdatedAt: new Date().toISOString(),
    ...overrides,
    startDate,
    endDate,
  }
}

export const mockTrips: Trip[] = [
  createTrip({
    name: "欧洲冒险之旅",
    destination: "巴黎, 法国",
  }),
  createTrip({
    name: "关西文化巡礼",
    destination: "京都, 日本",
    budget: {
      total: 4500,
      currency: "JPY",
      categories: {
        transport: 800,
        accommodation: 1800,
        food: 900,
        activities: 700,
        shopping: 200,
        other: 100,
      },
    },
  }),
  createTrip({
    name: "冰岛环岛自驾",
    destination: "雷克雅未克, 冰岛",
    budget: {
      total: 6200,
      currency: "USD",
      categories: {
        transport: 1500,
        accommodation: 2200,
        food: 800,
        activities: 1300,
        shopping: 200,
        other: 200,
      },
    },
  }),
]

export const featuredTripIds = mockTrips.slice(0, 2).map((trip) => trip.id)
