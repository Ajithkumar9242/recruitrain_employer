import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dashboardApi from '../services/dashboardApi';
import {
  fetchDashboardStart,
  fetchDashboardSuccess,
  fetchDashboardFailure,
  selectDashboard,
  selectDashboardOverview,
  selectPipelineSummary,
  selectTodaysInterviews,
  selectRecentActivity,
  selectRecentApplications,
  selectDashboardLoading,
  selectDashboardRefreshing,
  selectDashboardErrors,
} from '../store/slices/dashboardSlice';

export const useDashboard = () => {
  const dispatch = useDispatch();
  const dashboardState = useSelector(selectDashboard);
  const overview = useSelector(selectDashboardOverview);
  const pipelineSummary = useSelector(selectPipelineSummary);
  const todaysInterviews = useSelector(selectTodaysInterviews);
  const recentActivity = useSelector(selectRecentActivity);
  const recentApplications = useSelector(selectRecentApplications);
  const isLoading = useSelector(selectDashboardLoading);
  const isRefreshing = useSelector(selectDashboardRefreshing);
  const errors = useSelector(selectDashboardErrors);

  /**
   * Fetch all dashboard backend endpoints in parallel
   */
  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      dispatch(fetchDashboardStart({ isRefresh }));

      try {
        const [
          overviewRes,
          pipelineRes,
          interviewsRes,
          activityRes,
          applicationsRes,
        ] = await Promise.allSettled([
          dashboardApi.getOverview(),
          dashboardApi.getPipelineSummary(),
          dashboardApi.getTodaysInterviews(),
          dashboardApi.getRecentActivity(),
          dashboardApi.getRecentApplications(),
        ]);

        const overviewData = overviewRes.status === 'fulfilled' ? overviewRes.value : null;
        const pipelineData = pipelineRes.status === 'fulfilled' ? pipelineRes.value : [];
        const interviewsData = interviewsRes.status === 'fulfilled' ? interviewsRes.value : [];
        const activityData = activityRes.status === 'fulfilled' ? activityRes.value : [];
        const applicationsData = applicationsRes.status === 'fulfilled' ? applicationsRes.value : [];

        dispatch(
          fetchDashboardSuccess({
            overview: overviewData,
            pipelineSummary: pipelineData,
            todaysInterviews: interviewsData,
            recentActivity: activityData,
            recentApplications: applicationsData,
          })
        );
      } catch (err) {
        dispatch(fetchDashboardFailure(err));
      }
    },
    [dispatch]
  );

  return {
    dashboardState,
    overview,
    pipelineSummary,
    todaysInterviews,
    recentActivity,
    recentApplications,
    isLoading,
    isRefreshing,
    errors,
    loadDashboard,
    refreshDashboard: () => loadDashboard(true),
  };
};

export default useDashboard;
