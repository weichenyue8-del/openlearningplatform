export const siteConfig = {
  name: "OpenAP",
  description:
    "A free, open-source learning platform built by students, for students.",
  githubUrl: process.env.NEXT_PUBLIC_GITHUB_REPOSITORY_URL || null,
  contactUrl: process.env.NEXT_PUBLIC_CONTACT_URL || null,
} as const;
