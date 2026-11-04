// ============================================================
//  TEAM  (Coders-Club style: import the photo, then add a block)
//
//  NEW MEMBER = 2 places:
//   1) Put the photo in   src/assets/team/   (lowercase, no spaces, e.g. arpita.jpg)
//   2) In THIS file: add an `import` line below, then a block in MEMBERS.
//
//  The order you write the blocks is the order they appear on the site.
//  Leave a link as '' if the person doesn't have it (its icon is hidden).
//  The filter chips (Technical, Design, Events ...) are picked from the
//  position text automatically. Add `domain: 'Technical'` to force one.
// ============================================================

import ayushi from '../assets/team/ayushi.jpg'
import vrushabh from '../assets/team/vrushabh.jpg'
import yash from '../assets/team/yash.jpg'
import harsh from '../assets/team/harsh.jpg'
import shrushti from '../assets/team/shrushti.jpg'
import aditya from '../assets/team/aditya.jpg'
import harshdeep from '../assets/team/harshdeep.jpg'
import vidhi from '../assets/team/vidhi.jpg'
import chinmay from '../assets/team/chinmay.jpg'
import krutika from '../assets/team/krutika.jpg'
import aman from '../assets/team/aman.jpg'
import ritesh from '../assets/team/ritesh.jpg'
import prajakta from '../assets/team/prajakta.jpg'
import devanshu from '../assets/team/devanshu.jpg'
import riya from '../assets/team/riya.jpg'
import parth from '../assets/team/parth.jpg'
import ganesh from '../assets/team/ganesh.jpg'
import ashay from '../assets/team/ashay.jpg'
import ansh from '../assets/team/ansh.jpg'
import ishwari from '../assets/team/ishwari.jpg'
import niyati from '../assets/team/niyati.jpg'
import gunjan from '../assets/team/gunjan.jpg'
import { getTeamPhoto } from '../lib/teamPhoto'

const IT = 'Information Technology'
const CSE = 'Computer Science & Engineering'

// ---------------- Group photo (wide banner at the top of the Team section) ----------------
//  2 places:
//   1) Put ONE photo in   src/assets/team-photo/   (any file name, e.g. IMG_2034.jpg)
//   2) Change the caption / date below if you want.
//  No photo in that folder = the banner stays hidden.
export const TEAM_PHOTO = {
  src: getTeamPhoto(),
  caption: 'The Sipna AWS Club family',
  date: '', // optional, e.g. 'Inauguration day'
  focus: 'center 30%', // which part stays visible when the photo is cropped: 'center', 'top', 'center 20%' ...
}

// ---------------- Club Lead ----------------
export const LEADER = {
  name: 'Ayushi Sawarkar',
  position: 'AWS SBGL',
  department: IT,
  year: '3rd Year',
  img: ayushi,
  socials: {
    linkedin: 'https://www.linkedin.com/in/ayushi-sawarkar-460977343',
    github: 'https://github.com/Ayushi-588',
    instagram: 'https://www.instagram.com/_sawarkar_ayushi_',
  },
}

// ---------------- Core Team ----------------
export const CORE_TEAM = [
  {
    name: 'Vrushabh Shelokar',
    position: 'Technical Lead',
    department: CSE,
    year: '3rd Year',
    img: vrushabh,
    socials: {
      linkedin: 'https://www.linkedin.com/in/vrushabh-shelokar/',
      github: 'https://github.com/vrushabhshelokar',
      instagram: 'https://www.instagram.com/vrush_1337/',
    },
  },
  {
    name: 'Yash Papadkar',
    position: 'Management Lead',
    department: IT,
    year: '3rd Year',
    img: yash,
    socials: {
      linkedin: 'https://www.linkedin.com/in/yash-papadkar-95a155333/',
      github: 'https://github.com/The-Yash37',
      instagram: 'https://www.instagram.com/yash_papadkar_',
    },
  },
  {
    name: 'Harsh Rahate',
    position: 'Design Lead',
    department: IT,
    year: '3rd Year',
    img: harsh,
    socials: {
      linkedin: 'https://www.linkedin.com/in/harshrahate/',
      github: 'https://github.com/harshrahate09',
      instagram: 'https://www.instagram.com/rahateharsh09',
    },
  },
  {
    name: 'Shrushti Deshbhratar',
    position: 'Marketing Lead',
    department: IT,
    year: '3rd Year',
    img: shrushti,
    socials: {
      linkedin: 'https://www.linkedin.com/in/shrushti-deshbhratar-7127b3422',
      github: 'https://github.com/the-shrushti01',
      instagram: '',
    },
  },
  {
    name: 'Aditya Rathod',
    position: 'Content & Social Media Lead',
    department: 'Civil Engineering',
    year: '3rd Year',
    img: aditya,
    socials: {
      linkedin: 'https://www.linkedin.com/in/aditya-rathod-04125b333',
      github: '',
      instagram: 'https://www.instagram.com/_ur_adiii_17',
    },
  },
  {
    name: 'Harshdeep Sontakke',
    position: 'Sponsorship Lead',
    department: CSE,
    year: '2nd Year',
    img: harshdeep,
    socials: {
      linkedin: 'https://www.linkedin.com/in/harshdeep-sontakke-026879389',
      github: 'https://github.com/Harshdeep7107',
      instagram: 'https://www.instagram.com/_its_harshdeep',
    },
  },
]

// ---------------- Team Members ----------------
export const MEMBERS = [
  {
    name: 'Vidhi Manjare',
    position: 'Team Member (Event Management)',
    department: IT,
    year: '3rd Year',
    img: vidhi,
    socials: {
      linkedin: 'https://www.linkedin.com/in/vidhi-manjare-5b3810393',
      github: 'https://github.com/manjarevidhi-del',
      instagram: 'https://www.instagram.com/manjarevidhi',
    },
  },
  {
    name: 'Chinmay Barad',
    position: 'Team Member',
    department: IT,
    year: '3rd Year',
    img: chinmay,
    socials: {
      linkedin: 'https://www.linkedin.com/in/chinmay-barad-ab51b8342',
      github: '',
      instagram: 'https://www.instagram.com/chinmay.xii',
    },
  },
  {
    name: 'Krutika Bonde',
    position: 'Team Member',
    department: IT,
    year: '3rd Year',
    img: krutika,
    socials: {
      linkedin: 'https://www.linkedin.com/in/krutika-bonde-358569332',
      github: 'https://github.com/krutikabonde29-maker',
      instagram: 'https://www.instagram.com/krutika_bonde_29',
    },
  },
  {
    name: 'Aman Nakashe',
    position: 'Team Member (Technical)',
    department: IT,
    year: '3rd Year',
    img: aman,
    socials: {
      linkedin: 'https://www.linkedin.com/in/aman-nakashe12/',
      github: 'https://github.com/workamannakashe-sudo',
      instagram: 'https://www.instagram.com/amannakashe.12/',
    },
  },
  {
    name: 'Ritesh Pawar',
    position: 'Team Member (Event Management)',
    department: IT,
    year: '3rd Year',
    img: ritesh,
    socials: {
      linkedin: 'https://www.linkedin.com/in/ritesh-pawar-694730353',
      github: 'https://github.com/riteshpawar26',
      instagram: 'https://www.instagram.com/ritesh_deshmukh_26',
    },
  },
  {
    name: 'Prajakta Dhole',
    position: 'Team Member (Design)',
    department: CSE,
    year: '3rd Year',
    img: prajakta,
    socials: {
      linkedin: 'https://www.linkedin.com/in/prajakta-dhole-b0376a380',
      github: 'https://github.com/Prajakta05-abc',
      instagram: 'https://www.instagram.com/prajakta._.05',
    },
  },
  {
    name: 'Devanshu Ghawat',
    position: 'Team Member',
    department: IT,
    year: '3rd Year',
    img: devanshu,
    socials: {
      linkedin: 'https://www.linkedin.com/in/devanshu-d-ghawat-07a5813a6',
      github: 'https://github.com/devanshughawat',
      instagram: 'https://www.instagram.com/ghawatdevanshu',
    },
  },
  {
    name: 'Riya Surushe',
    position: 'Team Member (Design)',
    department: 'AI & Data Science',
    year: '3rd Year',
    img: riya,
    socials: {
      linkedin: 'https://www.linkedin.com/in/riya-surushe-49131b350',
      github: 'https://github.com/Riya-1210',
      instagram: 'https://www.instagram.com/riya_surushe_09',
    },
  },
  {
    name: 'Parth Gadekar',
    position: 'Team Member',
    department: IT,
    year: '2nd Year',
    img: parth,
    socials: {
      linkedin: 'https://www.linkedin.com/in/parth-gadekar-488882389',
      github: '',
      instagram: 'https://www.instagram.com/parthgadekar316',
    },
  },
  {
    name: 'Ganesh Satone',
    position: 'Team Member (Event Management)',
    department: IT,
    year: '2nd Year',
    img: ganesh,
    socials: {
      linkedin: 'https://www.linkedin.com/in/ganesh-satone-44b657381',
      github: '',
      instagram: 'https://www.instagram.com/___ganuuu_____',
    },
  },
  {
    name: 'Ashay Deshpande',
    position: 'Team Member (Event Management)',
    department: IT,
    year: '2nd Year',
    img: ashay,
    socials: {
      linkedin: 'https://www.linkedin.com/in/ashay-deshpande-554683387',
      github: 'https://github.com/ashaydeshpande31',
      instagram: 'https://www.instagram.com/iam_ashay8',
    },
  },
  {
    name: 'Ansh Gautam',
    position: 'Team Member (Technical)',
    department: IT,
    year: '2nd Year',
    img: ansh,
    socials: {
      linkedin: 'https://www.linkedin.com/in/ansh-gautam-7a248b382',
      github: 'https://github.com/anshgautam347-hash',
      instagram: 'https://www.instagram.com/ansh_gautam62',
    },
  },
  {
    name: 'Ishwari Umekar',
    position: 'Team Member (Publicity)',
    department: IT,
    year: '2nd Year',
    img: ishwari,
    socials: {
      linkedin: 'https://www.linkedin.com/in/ishwari-shankarrao-umekar-1936a1387',
      github: '',
      instagram: 'https://www.instagram.com/_umekarsishwari_07',
    },
  },
  {
    name: 'Niyati Dhanokar',
    position: 'Team Member (Technical)',
    department: IT,
    year: '2nd Year',
    img: niyati,
    socials: {
      linkedin: 'https://www.linkedin.com/in/niyati-dhanokar-78b26627a',
      github: 'https://github.com/niyatidhanokar',
      instagram: 'https://www.instagram.com/niyu.era',
    },
  },
  {
    name: 'Gunjan Amgaonkar',
    position: 'Team Member',
    department: IT,
    year: '2nd Year',
    img: gunjan,
    socials: {
      linkedin: 'https://www.linkedin.com/in/gunjan-amgaonkar-879baa387',
      github: '',
      instagram: 'https://www.instagram.com/iam_gunjan04',
    },
  },
]

// ============================================================
//  Helpers (no need to edit below this line)
// ============================================================

export const ALL_PEOPLE = [LEADER, ...CORE_TEAM, ...MEMBERS]

const DOMAIN_RULES = [
  ['Technical', /tech/i],
  ['Design', /design/i],
  ['Events', /event/i],
  ['Marketing & Media', /market|publicity|content|social|sponsor/i],
  ['Management', /manage/i],
]

export const DOMAIN_ORDER = [
  'Technical',
  'Design',
  'Events',
  'Marketing & Media',
  'Management',
  'General',
]

export function getDomain(person) {
  if (person.domain) return person.domain
  for (const [name, rule] of DOMAIN_RULES) if (rule.test(person.position)) return name
  return 'General'
}

export function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
