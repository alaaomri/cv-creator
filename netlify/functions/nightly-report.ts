import { getPrisma } from "../../server/db";

// Nightly scheduled function.
// Primary goal: perform a real database write every night so Supabase's free
// tier never pauses the project for inactivity. As a useful side effect it
// snapshots platform stats into the `health_reports` table.
//
// Schedule is declared in netlify.toml ([functions."nightly-report"]).
export const handler = async () => {
  const startedAt = Date.now();
  const prisma = getPrisma();

  if (!prisma) {
    const reason = process.env.DATABASE_URL
      ? "Prisma client unavailable (run `prisma generate` in the build)"
      : "DATABASE_URL not set";
    console.warn(`[nightly-report] Skipping keep-alive write — ${reason}.`);
    return { statusCode: 200, body: `skipped: ${reason}` };
  }

  try {
    // Reads keep the connection warm...
    const [users, cvs, published, viewsAgg, exports, logs] = await Promise.all([
      prisma.user.count(),
      prisma.cV.count(),
      prisma.cV.count({ where: { isPublished: true } }),
      prisma.cV.aggregate({ _sum: { viewCount: true } }),
      prisma.exportMetric.count(),
      prisma.activityLog.count(),
    ]);

    const stats = {
      users,
      cvs,
      published,
      views: viewsAgg?._sum?.viewCount ?? 0,
      exports,
      logs,
      generatedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
    };

    // ...and this write is what actually keeps Supabase awake.
    try {
      await prisma.healthReport.create({
        data: {
          users: stats.users,
          cvs: stats.cvs,
          published: stats.published,
          views: stats.views,
          exports: stats.exports,
          logs: stats.logs,
          source: "scheduled",
          payload: stats,
        },
      });
    } catch (writeErr: any) {
      // Fallback if `prisma db push` hasn't created health_reports yet: an
      // activity_logs write still counts as keep-alive activity.
      console.warn("[nightly-report] health_reports unavailable, falling back to activity_logs:", writeErr.message);
      await prisma.activityLog.create({
        data: {
          type: "NIGHTLY_HEALTH",
          title: "Rapport nocturne",
          details: JSON.stringify(stats),
        },
      });
    }

    console.log("[nightly-report] OK", stats);
    return { statusCode: 200, body: JSON.stringify({ success: true, stats }) };
  } catch (err: any) {
    console.error("[nightly-report] Failed:", err.message);
    return { statusCode: 500, body: JSON.stringify({ success: false, error: err.message }) };
  }
};
