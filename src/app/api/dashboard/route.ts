// src/app/api/dashboard/route.ts
import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Task from '@/lib/models/Task';
import { requireAuth } from '@/helpers/apiAuth';
import type { DashboardStats } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;

    // Get total task count
    const totalTasks = await Task.countDocuments();

    // Get total unique days (distinct dates)
    const uniqueDates = await Task.distinct('date');
    const totalDays = uniqueDates.length;

    // Get total images across all tasks
    const imageAggregation = await Task.aggregate([
      { $project: { imageCount: { $size: { $ifNull: ['$images', []] } } } },
      { $group: { _id: null, totalImages: { $sum: '$imageCount' } } },
    ]);
    const totalImages = imageAggregation[0]?.totalImages || 0;

    // Get recent 5 tasks sorted by date desc
    const recentTasks = await Task.find()
      .sort({ date: -1 })
      .limit(5)
      .lean();

    // Get daily task counts for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyAggregation = await Task.aggregate([
      { $match: { date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
          count: { $sum: { $size: '$tasks' } },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1,
        },
      },
    ]);

    const stats: DashboardStats = {
      totalTasks,
      totalDays,
      totalImages,
      recentTasks: recentTasks as unknown as DashboardStats['recentTasks'],
      dailyTaskCounts: dailyAggregation,
    };

    return Response.json(
      {
        success: true,
        data: stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
