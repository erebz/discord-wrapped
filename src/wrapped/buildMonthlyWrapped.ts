import { getCurrentMonthRange } from "../utils/dates";
import { queryWrappedData, WrappedData } from "./wrappedQueries";

export async function buildMonthlyWrapped(guildId: string): Promise<WrappedData> {
  const { start, end } = getCurrentMonthRange();
  return queryWrappedData(guildId, start, end);
}
