import type { Complaint, Priority } from '../types';

const departmentMap: Record<string, string> = {
  'Road Damage': 'Road & Transport Department',
  'Water Supply': 'Water Department',
  Electricity: 'Electricity Department',
  'Garbage/Sanitation': 'Municipal Sanitation Department',
  Drainage: 'Drainage Department',
  'Street Light': 'Electricity / Street Light Department',
  'Public Safety': 'Police / Public Safety Department',
  'Animal Emergency': 'Verified NGO Rescue Network',
  'Social Help': 'Social Welfare Department',
  Other: 'Civic Helpdesk'
};

const keywordCategory: Array<{ category: string; words: string[] }> = [
  { category: 'Road Damage', words: ['road', 'pothole', 'gaddha', 'sadak', 'accident', 'bridge', 'footpath'] },
  { category: 'Water Supply', words: ['water', 'pani', 'pipeline', 'leakage', 'tap', 'supply'] },
  { category: 'Electricity', words: ['light', 'bijli', 'electric', 'wire', 'spark', 'transformer', 'power'] },
  { category: 'Garbage/Sanitation', words: ['garbage', 'kachra', 'waste', 'sanitation', 'clean', 'dirty', 'safai'] },
  { category: 'Drainage', words: ['drain', 'drainage', 'sewer', 'nali', 'overflow'] },
  { category: 'Street Light', words: ['streetlight', 'street light', 'lamp', 'dark road'] },
  { category: 'Public Safety', words: ['crime', 'safety', 'danger', 'theft', 'fight', 'public safety'] },
  { category: 'Animal Emergency', words: ['dog', 'cow', 'cat', 'animal', 'injured', 'rescue', 'puppy'] },
  { category: 'Social Help', words: ['lost person', 'mentally', 'homeless', 'elderly', 'child', 'help'] }
];

const emergencyWords = ['spark', 'fire', 'accident', 'injured', 'danger', 'death', 'collapsed', 'flood', 'shock', 'bleeding'];
const highWords = ['urgent', '3 din', '5 din', 'school', 'hospital', 'main road', 'unsafe', 'overflow', 'blocked'];
const fraudWords = ['fake', 'test test', 'asdf', 'abuse', 'spam', 'random'];

export function analyzeComplaint(input: {
  title: string;
  description: string;
  selectedType: string;
  imageName?: string;
  existingComplaints: Complaint[];
  locationText?: string;
}) {
  const raw = `${input.title} ${input.description} ${input.imageName ?? ''} ${input.locationText ?? ''}`.toLowerCase();
  let category = input.selectedType && input.selectedType !== 'Auto Detect' ? input.selectedType : 'Other';

  if (category === 'Other' || category === 'Auto Detect') {
    const match = keywordCategory.find((item) => item.words.some((word) => raw.includes(word)));
    category = match?.category ?? 'Other';
  }

  let priority: Priority = 'Low';
  if (emergencyWords.some((word) => raw.includes(word))) priority = 'Emergency';
  else if (highWords.some((word) => raw.includes(word))) priority = 'High';
  else if (raw.length > 90) priority = 'Medium';

  if (category === 'Animal Emergency' && raw.includes('injured')) priority = 'Emergency';
  if (category === 'Electricity' && (raw.includes('wire') || raw.includes('spark'))) priority = 'Emergency';
  if (category === 'Road Damage' && (raw.includes('accident') || raw.includes('main road'))) priority = 'High';

  const duplicateRisk = estimateDuplicateRisk(raw, input.existingComplaints);
  const fraudRisk = fraudWords.some((word) => raw.includes(word)) ? 82 : Math.min(34, Math.round(Math.random() * 18 + (input.description.length < 15 ? 25 : 6)));
  const aiConfidence = Math.min(98, 82 + Math.round(Math.random() * 14));

  return {
    category,
    department: departmentMap[category] ?? 'Civic Helpdesk',
    priority,
    duplicateRisk,
    fraudRisk,
    aiConfidence,
    estimatedTime: getEstimatedTime(priority)
  };
}

function estimateDuplicateRisk(text: string, existing: Complaint[]) {
  if (existing.length === 0) return 8;
  const words = new Set(text.split(/\W+/).filter((w) => w.length > 3));
  let maxScore = 0;
  existing.forEach((complaint) => {
    const other = `${complaint.title} ${complaint.description} ${complaint.address}`.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    const common = other.filter((word) => words.has(word)).length;
    maxScore = Math.max(maxScore, Math.min(91, common * 16));
  });
  return Math.max(10, maxScore || Math.round(Math.random() * 20));
}

function getEstimatedTime(priority: Priority) {
  switch (priority) {
    case 'Emergency':
      return 'Within 24 hours';
    case 'High':
      return '2–3 days';
    case 'Medium':
      return '4–7 days';
    default:
      return '7–10 days';
  }
}
