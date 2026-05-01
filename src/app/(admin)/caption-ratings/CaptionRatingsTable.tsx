"use client";

import DataTable from "@/components/DataTable";

interface CaptionRatingStats {
  captionId: string;
  content: string | null;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  totalVotes: number;
  netScore: number;
}

interface Props {
  data: CaptionRatingStats[];
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function shortenId(id: string): string {
  return id.slice(0, 8);
}

export default function CaptionRatingsTable({ data }: Props) {
  const columns = [
    {
      key: "captionId",
      label: "ID",
      render: (value: unknown) => (
        <span className="font-mono text-xs text-slate-400">{shortenId(String(value))}</span>
      ),
    },
    {
      key: "content",
      label: "Caption",
      render: (value: unknown) => (
        <span className="line-clamp-2 max-w-md" title={String(value || "")}>
          {value ? `"${String(value)}"` : "—"}
        </span>
      ),
    },
    {
      key: "upvotes",
      label: "Upvotes",
      render: (value: unknown) => (
        <span className="text-emerald-400 font-medium">+{Number(value)}</span>
      ),
    },
    {
      key: "downvotes",
      label: "Downvotes",
      render: (value: unknown) => (
        <span className="text-red-400 font-medium">-{Number(value)}</span>
      ),
    },
    {
      key: "totalVotes",
      label: "Total",
      render: (value: unknown) => (
        <span className="text-slate-300 font-medium">{Number(value)}</span>
      ),
    },
    {
      key: "netScore",
      label: "Net Score",
      render: (value: unknown) => {
        const score = Number(value);
        const colorClass = score > 0 ? "text-emerald-400" : score < 0 ? "text-red-400" : "text-slate-400";
        return (
          <span className={`font-bold ${colorClass}`}>
            {score > 0 ? "+" : ""}{score}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value: unknown) => (
        <span className="text-slate-400 text-xs">{formatDate(String(value))}</span>
      ),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      searchKeys={["content", "captionId"]}
      pageSize={20}
    />
  );
}
