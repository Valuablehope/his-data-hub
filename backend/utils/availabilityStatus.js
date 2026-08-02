// Canonical statuses a team member can manually set (see frontend/src/components/StatusUpdater.jsx).
// 'Offline' is not user-selectable — it's the fallback/default when nothing else applies.
const AVAILABILITY_STATUSES = ['Online', 'In Field', 'On Leave', 'Busy'];

// A user's live status, factoring in today's WeeklySchedules override: if a schedule row
// exists for today and the current time falls outside its available window, they're forced
// 'Offline' regardless of what they last set manually. Otherwise falls back to their
// manually-set Availabilities.Status (or 'Offline' if never set). Shared by the availability
// list endpoint and the dashboard stats so both agree on who counts as online.
const RESOLVED_STATUS_SQL = `
    CASE
        WHEN w.Id IS NULL THEN ISNULL(a.Status, 'Offline')
        WHEN w.IsAvailable = 1 AND CAST(GETDATE() AS TIME) BETWEEN w.StartTime AND w.EndTime THEN ISNULL(a.Status, 'Offline')
        ELSE 'Offline'
    END
`;

const AVAILABILITY_JOIN_SQL = `
    LEFT JOIN Availabilities a ON a.UserId = u.Id
    LEFT JOIN WeeklySchedules w
        ON w.UserId = u.Id AND w.DayOfWeek = (DATEDIFF(day, '18991231', GETDATE()) % 7)
`;

module.exports = { AVAILABILITY_STATUSES, RESOLVED_STATUS_SQL, AVAILABILITY_JOIN_SQL };
