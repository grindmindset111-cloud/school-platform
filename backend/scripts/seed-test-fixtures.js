/* eslint-disable no-console */
const bcrypt = require('bcryptjs');
const { sequelize, User, ClassLevel, Course, Department, Subject } = require('../src/models');

(async () => {
  try {
    await sequelize.authenticate();

    // Update passwords via the hook (which hashes) — but the validator
    // requires passwords >= 9 chars, so we cannot use 'admin123'. The
    // beforeUpdate hook hashes the plaintext, so this is safe.
    const updatePassword = async (email, newPassword) => {
      const u = await User.scope('withSensitiveData').findOne({ where: { email } });
      if (!u) return null;
      u.password = newPassword;
      await u.save();
      return u;
    };

    const admin = await User.findOne({ where: { email: 'admin@test.com' } });
    if (!admin) {
      console.error('admin@test.com not found in DB');
      process.exit(1);
    }
    await updatePassword('admin@test.com', 'admin1234');
    console.log('admin password reset to: admin1234');

    const [dept] = await Department.findOrCreate({ where: { name: 'Sciences' } });
    const [course] = await Course.findOrCreate({
      where: { name: 'Biology' },
      defaults: { departmentId: dept.id }
    });
    const [cls] = await ClassLevel.findOrCreate({ where: { name: 'JSS1' } });

    const [subj] = await Subject.findOrCreate({
      where: { code: 'BIO101' },
      defaults: { name: 'Biology 101', classLevelId: cls.id, courseId: course.id }
    });

    let teacher = await User.findOne({ where: { email: 'teacher@test.com' } });
    if (!teacher) {
      teacher = await User.create({
        name: 'Test Teacher',
        email: 'teacher@test.com',
        role: 'STAFF',
        password: 'teacher1234',
        classLevelId: cls.id
      });
      await sequelize.query(
        'INSERT OR IGNORE INTO SubjectTeachers (subjectId, teacherId, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
        { replacements: [subj.id, teacher.id, new Date(), new Date()] }
      );
    } else {
      await updatePassword('teacher@test.com', 'teacher1234');
    }

    let student = await User.findOne({ where: { email: 'student@test.com' } });
    if (!student) {
      student = await User.create({
        name: 'Test Student',
        email: 'student@test.com',
        role: 'STUDENT',
        password: 'student1234',
        classLevelId: cls.id
      });
    } else {
      await updatePassword('student@test.com', 'student1234');
    }

    console.log(JSON.stringify({
      admin: { id: admin.id, email: admin.email, role: admin.role, password: 'admin1234' },
      teacher: { id: teacher.id, email: teacher.email, role: teacher.role, password: 'teacher1234' },
      student: { id: student.id, email: student.email, role: student.role, password: 'student1234', classLevelId: student.classLevelId },
      classLevel: { id: cls.id, name: cls.name },
      subject: { id: subj.id, code: subj.code, name: subj.name },
      course: { id: course.id, name: course.name },
      department: { id: dept.id, name: dept.name }
    }, null, 2));

    await sequelize.close();
  } catch (err) {
    console.error('seed error:', err);
    process.exit(1);
  }
})();