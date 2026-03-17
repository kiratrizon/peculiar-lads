import Model from "Illuminate/Database/Eloquent/Model.ts";

export type RecruitReadSchema = {
  id?: number;
  recruit_id: number;
  admin_id: number;
  read: boolean;
};

class RecruitRead extends Model<RecruitReadSchema> {
  protected static override _fillable = [
    "recruit_id",
    "admin_id",
    "read",
  ];


}

export default RecruitRead;
