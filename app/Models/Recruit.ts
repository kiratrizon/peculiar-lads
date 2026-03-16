import Model from "Illuminate/Database/Eloquent/Model.ts";

export type RecruitSchema = {
  id?: number;
  nstg: number;
  class: number;
  ign: string;
  discord: string;
  reason: string;
  // 0: pending, 1: approved, 2: rejected
  status: 0 | 1 | 2;
};

class Recruit extends Model<RecruitSchema> {
  protected static override _fillable = [
    "nstg",
    "class",
    "ign",
    "discord",
    "reason",
    "status",
  ];

  
}

export default Recruit;
