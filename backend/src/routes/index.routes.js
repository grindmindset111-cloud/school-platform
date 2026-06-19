const authRoutes = require('./auth.routes');
// const studentRoutes = require('./student.routes'); // ⚠️ Requires non-existent student.controller - students managed via user routes
const userRoutes = require('./user.routes');
const reportRoutes = require('./report.routes');
const bookingRoutes = require('./booking.routes');
const resourceRoutes = require('./resource.routes');
const resultRoutes = require('./result.routes');
const courseRoutes = require('./course.routes');
const departmentRoutes = require('./department.routes');
const semesterRoutes = require('./semester.routes');
const settingsRoutes = require('./settings.routes');
const auditRoutes = require('./audit.routes');
const classLevelRoutes = require('./classLevel.routes');
const timetableRoutes = require('./timetable.routes');
const subjectRoutes = require('./subject.routes');
const notificationRoutes = require('./notification.routes');
const dashboardRoutes = require('./dashboard.routes');
const healthRoutes = require('./health.routes');
const adminRoutes = require('./adminRoutes');


module.exports = (app) => {

    app.use('/api/auth', authRoutes);
    // app.use('/api/students', studentRoutes); // ⚠️ Requires non-existent student.controller
    app.use('/api/users', userRoutes);
    app.use('/api/reports', reportRoutes);

    app.use('/api/bookings', bookingRoutes);
    app.use('/api/resources', resourceRoutes);
    app.use('/api/results', resultRoutes);
    app.use('/api/courses', courseRoutes);
    app.use('/api/departments', departmentRoutes);
    app.use('/api/semesters', semesterRoutes);
    app.use('/api/settings', settingsRoutes);
    app.use('/api/audits', auditRoutes);
    app.use('/api/class-levels', classLevelRoutes);
    app.use('/api/timetable', timetableRoutes);
    app.use('/api/subjects', subjectRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/health', healthRoutes);
    app.use('/api/admin', adminRoutes);
};