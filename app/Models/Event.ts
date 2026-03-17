import Model from "Illuminate/Database/Eloquent/Model.ts";

export type EventSchema = {
  id?: number;
  email: string;
  password: string;
  name: string;
};

class Event extends Model<EventSchema> {
  protected static override _fillable = [];

  
}

export default Event;
