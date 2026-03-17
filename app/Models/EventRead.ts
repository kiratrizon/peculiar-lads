import Model from "Illuminate/Database/Eloquent/Model.ts";

export type EventReadSchema = {
  id?: number;
  event_id: number;
  role: number;
  read: boolean;
};

class EventRead extends Model<EventReadSchema> {
  protected static override _fillable = [
    "event_id",
    "role",
    "read",
  ];


}

export default EventRead;
