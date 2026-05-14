import { getCurrentWeekRange } from "../utils/dates";
import { queryWrappedData, WrappedData } from "./wrappedQueries";

export async function buildWeeklyWrapped(guildId: string): Promise<WrappedData> {
  const { start, end } = getCurrentWeekRange();
  return queryWrappedData(guildId, start, end);
}
