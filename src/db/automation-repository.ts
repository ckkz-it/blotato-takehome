import type { Automation } from "../domain/automation.js";
import { pool } from "./pool.js";

export interface AutomationRepository {
  findEnabledAutomations(): Promise<Automation[]>;
}

export const automationRepository: AutomationRepository = {
  // in non-simplified version it'd be a dedicated service with extendable matching logic
  // to support growing number of cases
  async findEnabledAutomations(): Promise<Automation[]> {
    const result = await pool.query<{
      id: string;
      version: number;
      trigger_keyword: string;
      final_link: string;
    }>(
      `SELECT id, version, trigger_keyword, final_link
       FROM automations
       WHERE enabled = TRUE`,
    );

    return result.rows.map((row) => ({
      id: row.id,
      version: row.version,
      triggerKeyword: row.trigger_keyword,
      finalLink: row.final_link,
    }));
  },
};
