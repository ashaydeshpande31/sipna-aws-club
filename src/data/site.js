// ============================================================
//  SITE CONTENT  (club text, links, FAQ, learning path)
//  Edit text here. The team lives in team.js, events in events.js.
// ============================================================

export const SITE = {
  name: 'Sipna AWS Club',
  college: 'Sipna College of Engineering & Technology, Amravati',
  address:
    'Sipna College of Engineering & Technology, In front of Nemani Godown, Badnera Road, Amravati, Maharashtra 444607',

  // Used only for the "Months Active" counter. Format: YYYY-MM-DD
  founded: '2026-07-01',

  // Shown in the footer. Set to '' to hide.
  credit: 'A.A.S.D',

  links: {
    // Paste your Google Form / registration link here. Empty = button shows "coming soon".
    joinForm: '',
    // Paste your WhatsApp community invite link here. Empty = button is hidden.
    whatsapp: 'https://chat.whatsapp.com/GXXex8U6TDl8xqDSXSJATu',
    // Social pages (check these are the real club accounts).
    linkedin: 'https://www.linkedin.com/company/aws-student-builder-group-at-sipna/',
    github: '',
    instagram: 'https://www.instagram.com/aws_sbg_sipna',
  },
}

// ---------- Text carried over word-for-word from the previous AWS Club site ----------

export const HERO = {
  badge: 'AWS Student Builder Group · Sipna COET',
  title: 'Discover the Power of Cloud Computing with AWS',
  highlight: ['Cloud', 'Computing'],
  subtitle:
    'Join Sipna AWS Club to master Amazon Web Services, participate in hands-on cloud bootcamps, and connect with peer developers.',
}

export const MISSION = {
  badge: 'Our Mission',
  title: 'Bridge Theory and Real-World Cloud Practice',
  description:
    'To provide students with continuous cloud education, practical labs, and mentorship, preparing them for successful careers in cloud architecture, DevOps, and software engineering.',
  objectives: [
    'Deliver practical hands-on workshops on core AWS services',
    'Guide students toward industry-recognized AWS Certifications',
  ],
}

export const VISION = {
  badge: 'Our Vision',
  title: 'A Campus Hub for Cloud Innovation',
  description:
    'To establish Sipna COET as a premier technical hub where every student gains fundamental cloud literacy and builds real-world serverless applications.',
}

export const BENEFITS = [
  {
    title: 'AWS Learning Opportunities',
    description:
      'Gain structured learning paths covering cloud fundamentals, EC2, S3, Lambda, and DevOps.',
  },
  {
    title: 'Hands-on Workshops',
    description:
      'Participate in step-by-step interactive labs building real cloud infrastructure.',
  },
  {
    title: 'Community & Networking',
    description:
      'Connect with senior students, cloud mentors, and fellow tech enthusiasts.',
  },
  {
    title: 'Career & Skill Growth',
    description:
      'Build a strong portfolio of cloud projects and prepare for AWS certifications.',
  },
]

// ---------- New sections ----------

// Scrolling strip under the hero
export const AWS_SERVICES = [
  'Amazon EC2',
  'Amazon S3',
  'AWS Lambda',
  'Amazon DynamoDB',
  'Amazon CloudFront',
  'AWS IAM',
  'Amazon VPC',
  'Amazon Route 53',
  'AWS Amplify',
  'Amazon API Gateway',
  'Amazon CloudWatch',
  'Amazon RDS',
  'Amazon ECS',
  'Amazon SageMaker',
  'Amazon Bedrock',
]

export const LEARNING_PATH = [
  {
    title: 'Cloud Fundamentals',
    text: 'What the cloud is, how AWS is organised, and how to practise safely inside the Free Tier.',
    cta: 'AWS Free Tier',
    href: 'https://aws.amazon.com/free/',
  },
  {
    title: 'Cloud Practitioner',
    text: 'Your first certification: core services, security basics and pricing.',
    cta: 'AWS Certification',
    href: 'https://aws.amazon.com/certification/',
  },
  {
    title: 'Hands-on Projects',
    text: 'Host a website on S3, run code on Lambda, store data in DynamoDB. Learn by building.',
    cta: 'AWS Skill Builder',
    href: 'https://skillbuilder.aws',
  },
  {
    title: 'Associate Level',
    text: 'Go deeper with Solutions Architect or Developer Associate and build a standout portfolio.',
    cta: 'AWS Certification',
    href: 'https://aws.amazon.com/certification/',
  },
]

export const FAQ = [
  {
    q: 'Who can join Sipna AWS Club?',
    a: 'Engineering students of all years and branches. Our team already spans IT, CSE, AI & Data Science and Civil.',
  },
  {
    q: 'Do I need cloud experience before joining?',
    a: 'No. We start from the fundamentals and move to hands-on labs on core services like EC2, S3 and Lambda.',
  },
  {
    q: 'What will I get from the club?',
    a: 'Structured learning paths, hands-on workshops, competitions, a community of builders, and guidance towards AWS certifications.',
  },
  {
    q: 'How do I join?',
    a: 'Use the Join button on this page to fill the registration form. Then follow our updates for the next event.',
  },
]
