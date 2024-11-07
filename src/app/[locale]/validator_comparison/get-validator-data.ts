export interface ValidatorData {
  id: number;
  moniker: string;
  healthChange: number;
  technicalScoreChanges: number;
  TVSGovernanceScoreChanges: number;
  userScoreChanges: number;
  socialScoreChanges: number;
  badges: number;
  reviews: number;
  tagsInTheWild: number;
  TVSGrowth: number;
  fanGrowth: number;
}
export interface ValidatorDataFilled {
  id: number;
  moniker: string;
  healthChange: { value: number; color: string };
  technicalScoreChanges: { value: number; color: string };
  TVSGovernanceScoreChanges: { value: number; color: string };
  userScoreChanges: { value: number; color: string };
  socialScoreChanges: { value: number; color: string };
  badges: { value: number; color: string };
  reviews: { value: number; color: string };
  tagsInTheWild: { value: number; color: string };
  TVSGrowth: number;
  fanGrowth: number;
}

const generateTestData = (id: number, name: string): ValidatorData => {
  return {
    id,
    moniker: name,
    healthChange: Math.ceil(Math.random() * 100),
    technicalScoreChanges: Math.ceil(Math.random() * 100),
    TVSGovernanceScoreChanges: Math.ceil(Math.random() * 100),
    userScoreChanges: Math.ceil(Math.random() * 100),
    socialScoreChanges: Math.ceil(Math.random() * 100),
    badges: Math.ceil(Math.random() * 500),
    reviews: Math.ceil(Math.random() * 700),
    tagsInTheWild: Math.ceil(Math.random() * 1000),
    TVSGrowth: 0,
    fanGrowth: 0,
  };
};

export default generateTestData;
