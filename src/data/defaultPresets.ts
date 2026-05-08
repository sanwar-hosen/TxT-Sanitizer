import type { Preset } from '@/types/preset';

export const DEFAULT_PRESETS: Preset[] = [
  {
    id: 'default01',
    name: 'ChatGPT → Normal',
    rules: [
      { priority: 1, find: '**', replace: '' },
      { priority: 2, find: '*',  replace: '-' },
      { priority: 3, find: '##', replace: '' },
      { priority: 4, find: '#',  replace: '' },
    ],
    isDefault: true,
  },
  {
    id: 'default02',
    name: 'Fiverr Words',
    rules: [
      { priority: 1, find: 'email',     replace: 'em-ail' },
      { priority: 2, find: 'mail',      replace: 'ma-il' },
      { priority: 3, find: 'phone',     replace: 'pho-ne' },
      { priority: 4, find: 'whatsapp',  replace: 'whats-app' },
      { priority: 5, find: 'telegram',  replace: 'tele-gram' },
      { priority: 6, find: 'instagram', replace: 'insta-gram' },
      { priority: 7, find: 'skype',     replace: 'sky-pe' },
      { priority: 8, find: 'discord',   replace: 'dis-cord' },
      { priority: 9, find: 'fiverr',    replace: 'fiv-err' },
    ],
    isDefault: true,
  },
];
