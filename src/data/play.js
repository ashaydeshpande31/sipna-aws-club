// ============================================================
//  /play  —  AWS quiz questions and architecture puzzles.
//  Add or edit freely. In QUIZ: "a" is the position (0-3) of the right option in "o".
// ============================================================

export const QUIZ = [
  { q: 'What does Amazon S3 stand for?', o: ['Simple Storage Service', 'Secure Server System', 'Scalable Stream Service', 'Standard Software Suite'], a: 0, why: 'S3 is Simple Storage Service: object storage for files of any kind.' },
  { q: 'Which service runs your code without you managing any servers?', o: ['Amazon EC2', 'AWS Lambda', 'Amazon RDS', 'AWS IAM'], a: 1, why: 'Lambda runs your code on demand and you pay only while it runs.' },
  { q: 'Which service is a managed relational (SQL) database?', o: ['Amazon RDS', 'Amazon S3', 'Amazon Route 53', 'AWS Lambda'], a: 0, why: 'RDS runs databases like MySQL and PostgreSQL and handles backups and patching.' },
  { q: 'Amazon DynamoDB is best described as…', o: ['A file system', 'A NoSQL key-value and document database', 'A message queue', 'A DNS service'], a: 1, why: 'DynamoDB is a fast, serverless NoSQL database.' },
  { q: 'What does AWS IAM control?', o: ['Network speed', 'Who can access what in your AWS account', 'Website colours', 'Billing emails only'], a: 1, why: 'IAM manages users, roles and permissions.' },
  { q: 'Amazon CloudFront is a…', o: ['Database', 'Content Delivery Network (CDN)', 'Virtual server', 'Code editor'], a: 1, why: 'CloudFront caches your content at edge locations close to your users.' },
  { q: 'Amazon Route 53 is mainly used for…', o: ['Video streaming', 'DNS and domain names', 'Machine learning', 'Email marketing'], a: 1, why: 'Route 53 is AWS\'s DNS service, and it can also register domains.' },
  { q: 'Amazon EC2 gives you…', o: ['Resizable virtual servers in the cloud', 'Only file storage', 'A chat tool', 'A physical laptop'], a: 0, why: 'EC2 provides virtual servers (instances) you can start and stop on demand.' },
  { q: 'In the AWS Shared Responsibility Model, what is AWS responsible for?', o: ['Your passwords', 'Security OF the cloud (data centres, hardware)', 'Your application code', 'Who you give access to'], a: 1, why: 'AWS secures the infrastructure; you secure what you put in the cloud.' },
  { q: 'What is an Availability Zone?', o: ['A country', 'One or more separate data centres inside a Region', 'A type of server', 'A billing plan'], a: 1, why: 'Spreading across Availability Zones keeps your app running if one fails.' },
  { q: 'Which service collects metrics, logs and alarms?', o: ['Amazon CloudWatch', 'Amazon SES', 'AWS Glue', 'Amazon Polly'], a: 0, why: 'CloudWatch is the monitoring and observability service.' },
  { q: 'Which is a key benefit of cloud computing?', o: ['Pay only for what you use', 'Buy all hardware upfront', 'No internet needed', 'Fixed capacity forever'], a: 0, why: 'Pay-as-you-go and instant scaling are core cloud benefits.' },
  { q: 'Which storage class is meant for cheap long-term archives?', o: ['S3 Glacier', 'EC2 instance store', 'RDS Multi-AZ', 'CloudFront'], a: 0, why: 'S3 Glacier storage classes are for rarely accessed data at low cost.' },
  { q: 'Which AWS certification is the usual first step?', o: ['Cloud Practitioner', 'Security Specialty', 'Machine Learning Specialty', 'Professional Architect'], a: 0, why: 'AWS Certified Cloud Practitioner covers the fundamentals.' },
  { q: 'Which service sends notifications to many subscribers (pub/sub)?', o: ['Amazon SNS', 'Amazon EBS', 'AWS Snowball', 'Amazon Lightsail'], a: 0, why: 'SNS fans messages out to emails, SMS, queues and more.' },
  { q: 'Which service is a message queue that decouples parts of an app?', o: ['Amazon SQS', 'Amazon VPC', 'AWS Shield', 'Amazon EFS'], a: 0, why: 'SQS holds messages until another part of your app is ready for them.' },
  { q: 'What does Elastic Load Balancing do?', o: ['Spreads incoming traffic across several targets', 'Stores backups', 'Registers domains', 'Trains models'], a: 0, why: 'It sends each request to a healthy server so no single one is overloaded.' },
  { q: 'AWS CloudFormation lets you…', o: ['Define infrastructure as code in templates', 'Edit photos', 'Watch videos', 'Write emails'], a: 0, why: 'You describe resources in a template and CloudFormation creates them for you.' },
  { q: 'Amazon Bedrock is used to…', o: ['Build generative AI apps with foundation models via an API', 'Host static images only', 'Manage DNS records', 'Store cold backups'], a: 0, why: 'Bedrock gives API access to foundation models from several providers.' },
  { q: 'What does the AWS Free Tier let you do?', o: ['Try many services free within limits', 'Use everything free forever', 'Skip creating an account', 'Get free certificates'], a: 0, why: 'Free Tier offers limited free usage so you can learn safely. Set billing alerts!' },
]

// Architecture puzzles. "slots" are in the order traffic flows. Tap the right service to fill each slot.
export const BUILDS = [
  {
    title: 'Host a fast static website',
    brief: 'Put the club website online with your own domain, HTTPS and fast loading worldwide.',
    slots: [
      { role: 'Domain & DNS', id: 'r53' },
      { role: 'Fast delivery (CDN)', id: 'cf' },
      { role: 'HTTPS certificate', id: 'acm' },
      { role: 'Store the files', id: 's3' },
    ],
    pool: ['s3', 'cf', 'r53', 'acm', 'ec2', 'rds', 'sage'],
  },
  {
    title: 'Serverless contact-form API',
    brief: 'A form sends a message. No servers to manage, and the message must be saved.',
    slots: [
      { role: 'Public API door', id: 'apigw' },
      { role: 'Run the code', id: 'lambda' },
      { role: 'Save the message', id: 'ddb' },
    ],
    pool: ['lambda', 'apigw', 'ddb', 'ec2', 'glacier', 'sage', 'cw'],
  },
  {
    title: 'Web app that survives a rush',
    brief: 'Exam-result day: thousands of students arrive at once. The app must not go down.',
    slots: [
      { role: 'Share the traffic', id: 'elb' },
      { role: 'Servers that scale', id: 'ec2' },
      { role: 'Relational database', id: 'rds' },
      { role: 'Watch & alarm', id: 'cw' },
    ],
    pool: ['elb', 'ec2', 'rds', 'cw', 'lambda', 'glacier', 'acm'],
  },
]

// name, one-line role, why-not hint, lucide icon key
export const SERVICES = {
  s3: { name: 'Amazon S3', does: 'Stores files (objects) of any size, very durable.', icon: 'HardDrive' },
  cf: { name: 'CloudFront', does: 'CDN: serves content from locations near your users.', icon: 'Network' },
  r53: { name: 'Route 53', does: 'DNS: turns your domain name into the right address.', icon: 'Globe' },
  acm: { name: 'Certificate Manager', does: 'Free HTTPS certificates for your domain.', icon: 'Lock' },
  ec2: { name: 'Amazon EC2', does: 'Virtual servers you control and can scale out.', icon: 'Server' },
  rds: { name: 'Amazon RDS', does: 'Managed SQL database with backups and failover.', icon: 'Database' },
  sage: { name: 'SageMaker', does: 'Builds and trains machine-learning models.', icon: 'Brain' },
  lambda: { name: 'AWS Lambda', does: 'Runs code on demand, no servers to manage.', icon: 'Zap' },
  apigw: { name: 'API Gateway', does: 'Creates the public HTTPS API in front of your code.', icon: 'Webhook' },
  ddb: { name: 'DynamoDB', does: 'Serverless NoSQL database, fast at any scale.', icon: 'Database' },
  glacier: { name: 'S3 Glacier', does: 'Cheap cold storage for rarely used archives.', icon: 'Archive' },
  cw: { name: 'CloudWatch', does: 'Metrics, logs and alarms for your app.', icon: 'Activity' },
  elb: { name: 'Load Balancer', does: 'Spreads requests across healthy servers.', icon: 'Network' },
}
