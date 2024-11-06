export interface User {
  _id: string;
  mobile: string;
  name?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
  savedProjects: string[];
  profile: Profile;
}

interface Profile {
  name?: string;
  email?: string;
  city?: string;
  source?: string;
}
