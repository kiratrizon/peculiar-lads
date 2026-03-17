import Model from "Illuminate/Database/Eloquent/Model.ts";

export type EventSchema = {
  id?: number;

  title: string;
  description: string;
  image: string;
  link: string;
  type: string;
  status: number;
  start_date: string;
  end_date: string;
};

class Event extends Model<EventSchema> {

  protected static override _guarded: string[] = ["id"];
}

export default Event;
