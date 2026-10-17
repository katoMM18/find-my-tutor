export type StudentDiscoveryFilters = {
  search?: string;
  subject?: string;
  page: number;
  limit: number;
};

export type PublicStudent = {
  id: string;
  userId: string;
  name: string;
  avatar: string | null;
  bio: string;
  subjects: string[];
};

export type StudentDiscoveryResult = {
  items: PublicStudent[];
  total: number;
  page: number;
  limit: number;
};
