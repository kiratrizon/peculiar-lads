import Model from "Illuminate/Database/Eloquent/Model.ts";

export type RecruitSchema = {
  id?: number;
  nstg: number;
  class: number;
  ign: string;
  discord: string;
  reason: string;
  email: string;
  // 0: pending, 1: invited, 2: rejected, 3: accepted
  status: 0 | 1 | 2;
  invitation_link?: string;
  // 0: not verified, 1: verified, 2: blocklisted
  verified: 0 | 1 | 2;
};

class Recruit extends Model<RecruitSchema> {
  protected static override _fillable = [
    "nstg",
    "class",
    "ign",
    "discord",
    "reason",
    "status",
    "email",
    "invitation_link",
    "verified",
  ];

  protected static override _accessors = {
    invitation_link: (value: unknown) => {
      if (!isset(value)) {
        return null;
      }
      return `${config("app.url")}/signup/${String(value)}`;
    }
  }

}

export default Recruit;
