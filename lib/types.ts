export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  scope: string;
}

export interface Badge {
  id: string;
  label: string;
  color: string;
  logo: string;
  logoColor: string;
}

export interface BadgeCategory {
  id: string;
  name: string;
  badges: Badge[];
}

export interface Goal {
  id: string;
  text: string;
  completed: boolean;
  note: string;
}

export interface FormData {
  name: string;
  location: string;
  typingLines: string;
  tagline: string;
  bio: string;
  githubUsername: string;
  email: string;
  whatIBuildLeftTitle: string;
  whatIBuildLeftDesc: string;
  whatIBuildRightTitle: string;
  whatIBuildRightDesc: string;
  achievements: Achievement[];
  badgeCategories: BadgeCategory[];
  featuredRepos: string[];
  goals: Goal[];
  goalsYear: string;
  shoutoutUsername: string;
  shoutoutMessage: string;
  showFollowerGoal: boolean;
  showTrophies: boolean;
  showChart: boolean;
  showTools: boolean;
  showOpenToCollab: boolean;
}
