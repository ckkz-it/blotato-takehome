import { pool } from "./pool.js";

export interface EventRepository {
  tryMarkProcessed(platform: string, externalEventId: string): Promise<boolean>;
}

export const eventRepository: EventRepository = {
  async tryMarkProcessed(platform: string, externalEventId: string): Promise<boolean> {
    const result = await pool.query(
      `INSERT INTO processed_events (platform, external_event_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING external_event_id`,
      [platform, externalEventId],
    );

    return result.rowCount === 1;
  },
};
