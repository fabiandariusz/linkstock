import { Item } from './store';

const SWATCHES = ['#d9aa5c', '#7a9e7e', '#6b7fa3', '#b06a4b', '#8a7ba8', '#5e9e9e'];

function swatch(idx: number): string {
  return SWATCHES[idx % SWATCHES.length];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const SEED_ITEMS: Omit<Item, 'id'>[] = [
  {
    url: 'https://essays.co/slow-web',
    title: 'The Slow Web',
    excerpt: 'How slowing down changed the way I read. A meditation on intentional consumption in an age of infinite scroll.',
    author: 'Jack Cheng',
    site: 'essays.co',
    minutes: 8,
    savedAt: daysAgo(0),
    progress: 0.42,
    tags: ['reading', 'focus'],
    collectionId: null,
    kind: 'article',
    highlights: [],
    notes: {},
    unread: false,
  },
  {
    url: 'https://aeon.co/ideas/why-the-past-is-not-what-it-used-to-be',
    title: 'Why the past is not what it used to be',
    excerpt: 'Memory is not a recording device. It is a creative act, reconstructing the past in light of the present.',
    author: 'Alison Winter',
    site: 'aeon.co',
    minutes: 12,
    savedAt: daysAgo(1),
    progress: 0,
    tags: ['psychology', 'memory'],
    collectionId: null,
    kind: 'article',
    highlights: [],
    notes: {},
    unread: true,
  },
  {
    url: 'https://youtube.com/watch?v=abc123',
    title: 'The Art of Deliberate Practice — Anders Ericsson',
    excerpt: 'A lecture on how top performers reach mastery through purposeful, focused practice over raw repetition.',
    author: 'Anders Ericsson',
    site: 'youtube.com',
    minutes: 32,
    savedAt: daysAgo(2),
    progress: 0,
    tags: ['learning', 'performance'],
    collectionId: null,
    kind: 'video',
    highlights: [],
    notes: {},
    unread: true,
  },
  {
    url: 'https://paulgraham.com/writing44.html',
    title: 'Writing, Briefly',
    excerpt: "If you want to write clearly, write as if you were talking to someone who is smart but doesn't know what you know.",
    author: 'Paul Graham',
    site: 'paulgraham.com',
    minutes: 5,
    savedAt: daysAgo(3),
    progress: 0,
    tags: ['writing', 'craft'],
    collectionId: null,
    kind: 'article',
    highlights: [],
    notes: {},
    unread: true,
  },
  {
    url: 'https://nautil.us/the-man-who-smashed-physics-243210',
    title: 'The Man Who Smashed Physics',
    excerpt: "Richard Feynman didn't just explain quantum mechanics. He reimagined what it meant to understand something at all.",
    author: 'K.C. Cole',
    site: 'nautil.us',
    minutes: 18,
    savedAt: daysAgo(4),
    progress: 0.75,
    tags: ['physics', 'biography'],
    collectionId: null,
    kind: 'article',
    highlights: [],
    notes: {},
    unread: false,
  },
  {
    url: 'https://laphamsquarterly.org/time/clocks-everywhere',
    title: 'Clocks Everywhere',
    excerpt: 'A history of how mechanical timekeeping remade labour, leisure, and the human sense of urgency.',
    author: 'David Landes',
    site: 'laphamsquarterly.org',
    minutes: 14,
    savedAt: daysAgo(5),
    progress: 0,
    tags: ['history', 'time'],
    collectionId: null,
    kind: 'article',
    highlights: [],
    notes: {},
    unread: true,
  },
];

export function swatchForUrl(url: string): string {
  const idx = url.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return swatch(idx);
}
