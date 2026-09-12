import type { Automation, AutomationDefinition } from "../domain/automation.js";
import { pool } from "./pool.js";

export interface AutomationRepository {
  findEnabledAutomations(): Promise<Automation[]>;
}

export const automationRepository: AutomationRepository = {
  // A larger system would validate definitions at this repository boundary and
  // delegate matching to a registry of trigger implementations.
  async findEnabledAutomations(): Promise<Automation[]> {
    const result = await pool.query<{
      id: string;
      version: number;
      definition: AutomationDefinition;
    }>(
      `SELECT id, version, definition
       FROM automations
       WHERE enabled = TRUE`,
    );

    return result.rows.map((row) => ({
      id: row.id,
      version: row.version,
      ...row.definition,
    })) as Automation[];
  },
};
