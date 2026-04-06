import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean up existing data
  await prisma.match.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.internship.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.employerProfile.deleteMany({});
  await prisma.applicantProfile.deleteMany({});
  await prisma.user.deleteMany({});

  const adminPassword = await bcrypt.hash('admin', 10);
  const employerPassword = await bcrypt.hash('employer', 10);
  const applicantPassword = await bcrypt.hash('applicant', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@gmail.com',
      password: adminPassword,
      role: 'ADMIN',
      accountStatus: 'APPROVED',
    } as any,
  });

  // 2. Create Skills
  const skills = ['JavaScript', 'React', 'Node.js', 'Python', 'Machine Learning', 'UI/UX', 'SQL', 'MongoDB'];
  const createdSkills = [];
  for (const skill of skills) {
    createdSkills.push(await prisma.skill.create({ data: { name: skill } }));
  }

  // 3. Create Employers
  const employerData = [
    { name: 'TechCorp HR', email: 'employer@gmail.com', companyName: 'TechCorp', industry: 'Software', location: 'Remote', description: 'Leading tech innovator.', password: employerPassword }
  ];

  const createdEmployers = [];
  for (const emp of employerData) {
    const user = await prisma.user.create({
      data: {
        name: emp.name,
        email: emp.email,
        password: emp.password,
        role: 'EMPLOYER',
        accountStatus: 'APPROVED',
        employerProfile: {
          create: {
            companyName: emp.companyName,
            industry: emp.industry,
            location: emp.location,
            description: emp.description,
          }
        }
      } as any,
      include: { employerProfile: true } as any
    });
    createdEmployers.push(user);
  }

  // 4. Create Applicants
  const applicantData = [
    { name: 'John Doe', email: 'applicant@gmail.com', course: 'Computer Science', yearLevel: '3rd Year', locationPreference: 'Remote', password: applicantPassword }
  ];

  const createdApplicants = [];
  for (const app of applicantData) {
    const user = await prisma.user.create({
      data: {
        name: app.name,
        email: app.email,
        password: app.password,
        role: 'APPLICANT',
        accountStatus: 'APPROVED',
        applicantProfile: {
          create: {
            course: app.course,
            yearLevel: app.yearLevel,
            locationPreference: app.locationPreference,
            skills: {
              connect: [{ id: createdSkills[0]!.id }, { id: createdSkills[1]!.id }] // JS, React
            }
          }
        }
      } as any,
      include: { applicantProfile: true } as any
    });
    createdApplicants.push(user);
  }

  // 5. Create Internships
  await prisma.internship.create({
    data: {
      employerId: (createdEmployers[0] as any).employerProfile.id,
      title: 'Frontend Developer Intern',
      description: 'Looking for a React enthusiast.',
      location: 'Remote',
      skills: {
        connect: [{ id: createdSkills[1]!.id }, { id: createdSkills[5]!.id }] // React, UI/UX
      }
    }
  });

  await prisma.internship.create({
    data: {
      employerId: (createdEmployers[0] as any).employerProfile.id,
      title: 'Data Science Intern',
      description: 'Work with Python and ML models.',
      location: 'New York',
      skills: {
        connect: [{ id: createdSkills[3]!.id }, { id: createdSkills[4]!.id }] // Python, ML
      }
    }
  });

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
