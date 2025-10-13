export const siteConfig = {
  name: "Voyager",
  description: "全方位的旅行行程规划与协同平台",
  url: "https://travel.example.com",
  links: {
    github: "https://github.com/your-org/travel-app",
    twitter: "https://x.com/your-org",
  },
  navigation: [
    { title: "首页", href: "/" },
    { title: "行程日历", href: "/calendar" },
    { title: "我的行程", href: "/trips" },
    { title: "模板库", href: "/templates" },
  ],
}

export type SiteConfig = typeof siteConfig
