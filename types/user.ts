// src/types/user.ts
export interface Employee {
  id: string
  name: string | null
  email: string | null          // 允許 null，較安全
  _count?: {                    // 設為 optional，避免在所有地方都要有
    assignedProjects: number
  }
}