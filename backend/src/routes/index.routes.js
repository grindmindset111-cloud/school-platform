const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const userRoutes = require('./routes/user.routes');
const reportRoutes = require('./routes/report.routes');
const bookingRoutes = require('./routes/booking.routes');
const resourceRoutes = require('./routes/resource.routes');
const resultRoutes = require('./routes/result.routes');
const courseRoutes = require('./routes/course.routes');
const departmentRoutes = require('./routes/department.routes');
const semesterRoutes = require('./routes/semester.routes');
const settingsRoutes = require('./routes/settings.routes');
const auditRoutes = require('./routes/audit.routes');
const classLevelRoutes = require('./routes/classLevel.routes');
const timetableRoutes = require('./routes/timetable.routes');
const subjectRoutes = require('./routes/subject.routes');
const notificationRoutes = require('./routes/notification.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const healthRoutes = require('./routes/health.routes');
const adminRoutes = require('./routes/adminRoutes');


module.exports = (app) => {

    app.use('/api/auth', authRoutes);
    app.use('/api/students', studentRoutes);
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