import React from "react";
import { Box, Text } from "ink";

export interface DashboardRow {
  name: string;
  branch: string;
  dirty: boolean;
  claudeStatus: "active" | "inactive" | "unknown";
}

interface Props {
  rows: DashboardRow[];
}

const COL = { name: 16, branch: 24, status: 10, claude: 10 };

function pad(s: string, width: number): string {
  return s.length >= width ? s.slice(0, width) : s + " ".repeat(width - s.length);
}

export function StatusDashboard({ rows }: Props) {
  return (
    <Box flexDirection="column">
      <Box>
        <Text bold>{pad("Name", COL.name)}</Text>
        <Text bold>{pad("Branch", COL.branch)}</Text>
        <Text bold>{pad("Status", COL.status)}</Text>
        <Text bold>{pad("Claude", COL.claude)}</Text>
      </Box>
      {rows.map((row) => (
        <Box key={row.name}>
          <Text>{pad(row.name, COL.name)}</Text>
          <Text>{pad(row.branch, COL.branch)}</Text>
          <Text color={row.dirty ? "yellow" : "green"}>
            {pad(row.dirty ? "dirty" : "clean", COL.status)}
          </Text>
          <Text dimColor>{pad(row.claudeStatus, COL.claude)}</Text>
        </Box>
      ))}
    </Box>
  );
}
