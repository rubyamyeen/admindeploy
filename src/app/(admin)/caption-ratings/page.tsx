import { createClient } from "@/lib/supabase/server";
import CaptionRatingsTable from "./CaptionRatingsTable";

interface CaptionRow {
  id: string;
  content: string | null;
  created_datetime_utc: string;
}

interface VoteRow {
  caption_id: string;
  vote_value: number;
}

interface CaptionRatingStats {
  captionId: string;
  content: string | null;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  totalVotes: number;
  netScore: number;
}

interface AggregateStats {
  totalCaptions: number;
  totalVotes: number;
  totalUpvotes: number;
  totalDownvotes: number;
  netScore: number;
  avgVotesPerCaption: number;
  captionsWithVotes: number;
}

interface PageData {
  aggregateStats: AggregateStats;
  captionStats: CaptionRatingStats[];
  error: string | null;
}

async function getCaptionRatingData(): Promise<PageData> {
  try {
    const supabase = await createClient();

    // Fetch captions and votes in parallel
    const [captionsResult, votesResult] = await Promise.all([
      supabase
        .from("captions")
        .select("id, content, created_datetime_utc")
        .order("created_datetime_utc", { ascending: false })
        .limit(1000),
      supabase
        .from("caption_votes")
        .select("caption_id, vote_value")
        .limit(10000),
    ]);

    if (captionsResult.error) {
      console.error("[CaptionRatings] Captions query error:", captionsResult.error);
      return {
        aggregateStats: emptyAggregateStats(),
        captionStats: [],
        error: captionsResult.error.message,
      };
    }

    if (votesResult.error) {
      console.error("[CaptionRatings] Votes query error:", votesResult.error);
      return {
        aggregateStats: emptyAggregateStats(),
        captionStats: [],
        error: votesResult.error.message,
      };
    }

    const captions = (captionsResult.data ?? []) as CaptionRow[];
    const votes = (votesResult.data ?? []) as VoteRow[];

    // Group votes by caption_id
    const votesByCaption = new Map<string, { upvotes: number; downvotes: number }>();
    for (const vote of votes) {
      const existing = votesByCaption.get(vote.caption_id) || { upvotes: 0, downvotes: 0 };
      if (vote.vote_value === 1) {
        existing.upvotes += 1;
      } else if (vote.vote_value === -1) {
        existing.downvotes += 1;
      }
      votesByCaption.set(vote.caption_id, existing);
    }

    // Build caption stats
    const captionStats: CaptionRatingStats[] = captions.map((caption) => {
      const voteCounts = votesByCaption.get(caption.id) || { upvotes: 0, downvotes: 0 };
      return {
        captionId: caption.id,
        content: caption.content,
        createdAt: caption.created_datetime_utc,
        upvotes: voteCounts.upvotes,
        downvotes: voteCounts.downvotes,
        totalVotes: voteCounts.upvotes + voteCounts.downvotes,
        netScore: voteCounts.upvotes - voteCounts.downvotes,
      };
    });

    // Sort by net score descending
    captionStats.sort((a, b) => b.netScore - a.netScore);

    // Compute aggregate stats
    const totalCaptions = captions.length;
    const totalUpvotes = votes.filter((v) => v.vote_value === 1).length;
    const totalDownvotes = votes.filter((v) => v.vote_value === -1).length;
    const totalVotes = votes.length;
    const netScore = totalUpvotes - totalDownvotes;
    const captionsWithVotes = votesByCaption.size;
    const avgVotesPerCaption = totalCaptions > 0 ? Math.round((totalVotes / totalCaptions) * 10) / 10 : 0;

    return {
      aggregateStats: {
        totalCaptions,
        totalVotes,
        totalUpvotes,
        totalDownvotes,
        netScore,
        avgVotesPerCaption,
        captionsWithVotes,
      },
      captionStats,
      error: null,
    };
  } catch (err) {
    console.error("[CaptionRatings] Unexpected error:", err);
    return {
      aggregateStats: emptyAggregateStats(),
      captionStats: [],
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

function emptyAggregateStats(): AggregateStats {
  return {
    totalCaptions: 0,
    totalVotes: 0,
    totalUpvotes: 0,
    totalDownvotes: 0,
    netScore: 0,
    avgVotesPerCaption: 0,
    captionsWithVotes: 0,
  };
}

export default async function CaptionRatingsPage() {
  const { aggregateStats, captionStats, error } = await getCaptionRatingData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Caption Rating Statistics</h1>
        <span className="text-sm text-slate-400">{captionStats.length} captions</span>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <p className="text-red-400 font-medium">Failed to load rating data</p>
          <p className="text-red-400/80 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Captions */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm text-white/80 font-medium">Total Captions</p>
          <p className="text-4xl font-bold text-white mt-2 tracking-tight">{aggregateStats.totalCaptions.toLocaleString()}</p>
        </div>

        {/* Total Votes */}
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-white/80 font-medium">Total Votes</p>
          <p className="text-4xl font-bold text-white mt-2 tracking-tight">{aggregateStats.totalVotes.toLocaleString()}</p>
          <p className="text-sm text-white/60 mt-1">{aggregateStats.avgVotesPerCaption} avg per caption</p>
        </div>

        {/* Net Score */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-sm text-white/80 font-medium">Net Score</p>
          <p className="text-4xl font-bold text-white mt-2 tracking-tight">{aggregateStats.netScore >= 0 ? "+" : ""}{aggregateStats.netScore.toLocaleString()}</p>
        </div>

        {/* Captions with Votes */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-sm text-white/80 font-medium">Captions with Votes</p>
          <p className="text-4xl font-bold text-white mt-2 tracking-tight">{aggregateStats.captionsWithVotes.toLocaleString()}</p>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#1a2332]/80 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Upvotes</p>
          <p className="text-2xl font-bold text-emerald-400 mt-2 tracking-tight">{aggregateStats.totalUpvotes.toLocaleString()}</p>
        </div>
        <div className="bg-[#1a2332]/80 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Downvotes</p>
          <p className="text-2xl font-bold text-red-400 mt-2 tracking-tight">{aggregateStats.totalDownvotes.toLocaleString()}</p>
        </div>
        <div className="bg-[#1a2332]/80 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Votes/Caption</p>
          <p className="text-2xl font-bold text-white mt-2 tracking-tight">{aggregateStats.avgVotesPerCaption}</p>
        </div>
        <div className="bg-[#1a2332]/80 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vote Rate</p>
          <p className="text-2xl font-bold text-white mt-2 tracking-tight">
            {aggregateStats.totalCaptions > 0
              ? Math.round((aggregateStats.captionsWithVotes / aggregateStats.totalCaptions) * 100)
              : 0}%
          </p>
        </div>
      </div>

      {/* Caption-Level Stats Table */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Caption Details</h2>
        <CaptionRatingsTable data={captionStats} />
      </div>
    </div>
  );
}
