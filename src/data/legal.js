// ============================================================
//  LEGAL / POLICY PAGES  (/privacy  /terms  /conduct)
//  Plain-language text for a student community website.
//  Update "updated" whenever you change something. Have a faculty coordinator read it once.
// ============================================================

import { SITE } from './site'
import { CONTACT } from './contact'

const contactLine = CONTACT.email
  ? `write to us at ${CONTACT.email}`
  : 'use the Connect page on this website, or message us on Instagram or WhatsApp'

export const LEGAL = {
  privacy: {
    title: 'Privacy Policy',
    updated: '2026-11-18',
    intro: `${SITE.name} is a student community at ${SITE.college}. This page explains, in plain words, what information this website handles.`,
    sections: [
      {
        h: 'What we collect',
        p: [
          'Only what you choose to send us. If you use the contact form on the Connect page, we receive the name, email address and message you type in.',
          'If you join through our Google Form or WhatsApp community, that information is handled by Google or WhatsApp under their own policies.',
        ],
      },
      {
        h: 'What we do not do',
        p: [
          'This website does not use advertising trackers or sell any data. It does not ask you to create an account.',
          'The site remembers one small thing in your browser while the tab is open: that you have already seen the welcome intro, so it does not replay.',
        ],
      },
      {
        h: 'How your message is used',
        p: [
          'Contact messages are used only to reply to you and to organise club activities. They are seen by the club team and are not shared with outsiders.',
        ],
      },
      {
        h: 'Services that help run the site',
        p: [
          'The site is hosted on Vercel. Contact-form messages are delivered through Web3Forms. Photos and videos of club events are shown to share what the club does.',
        ],
      },
      {
        h: 'Photos and videos',
        p: [
          'Event photos and videos may include participants. If you would like a picture of you removed, tell us and we will take it down.',
        ],
      },
      {
        h: 'Your choices',
        p: [`You can ask us to correct or delete anything you have sent us. To do that, ${contactLine}.`],
      },
    ],
  },

  terms: {
    title: 'Terms of Use',
    updated: '2026-11-18',
    intro: `By using this website you agree to these simple terms. ${SITE.name} is run by students, for students.`,
    sections: [
      {
        h: 'About this website',
        p: [
          `${SITE.name} is an AWS Student Builder Group at ${SITE.college}. It is an independent student community. It is not operated, owned or endorsed by Amazon Web Services or Amazon.com, Inc.`,
          'AWS and related names and logos are trademarks of Amazon.com, Inc. or its affiliates and are used here only to describe the topics we teach.',
        ],
      },
      {
        h: 'Using the site',
        p: [
          'You may browse, share links and use the information for your own learning. Please do not misuse the website, attempt to break it, or send spam through the contact form.',
        ],
      },
      {
        h: 'Content',
        p: [
          'Event details, dates and plans can change. We try to keep them correct but cannot promise they are always up to date.',
          'Text, design and photos on this site belong to the club and the people who created them. Please ask before reusing them.',
        ],
      },
      {
        h: 'External links',
        p: ['Links to other websites (AWS, WhatsApp, Instagram, LinkedIn and others) are for your convenience. We are not responsible for what those sites contain.'],
      },
      {
        h: 'Changes',
        p: ['We may update these terms from time to time. The date at the top shows when they were last changed.'],
      },
    ],
  },

  conduct: {
    title: 'Code of Conduct',
    updated: '2026-11-18',
    intro: `We want every workshop, event and chat of ${SITE.name} to be a place where all students feel welcome and can learn.`,
    sections: [
      {
        h: 'What we expect',
        p: [
          'Be respectful and kind to everyone, whatever their year, branch, background or skill level. Questions are always welcome.',
          'Help others learn. Share what you know, credit people for their work, and be honest in competitions and assignments.',
        ],
      },
      {
        h: 'What is not accepted',
        p: [
          'Harassment, bullying, insulting or discriminatory language, or unwelcome attention, online or in person.',
          'Cheating or plagiarism in contests, sharing someone else\'s private information, or spamming our community groups.',
          'Misusing cloud accounts or credits, or doing anything illegal with the skills learned in the club.',
        ],
      },
      {
        h: 'Staying safe in the cloud',
        p: [
          'Never share your AWS access keys or passwords. Set up billing alerts and delete resources after labs so you are not charged by surprise.',
        ],
      },
      {
        h: 'If something goes wrong',
        p: [
          'If you see or experience behaviour that breaks this code, tell any member of the core team or contact us directly. We will listen and handle it fairly and privately.',
          'Members who break the code may be warned, asked to leave an event, or removed from the community.',
        ],
      },
    ],
  },
}
