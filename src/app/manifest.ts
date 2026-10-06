import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MyTasks — Proste zarządzanie zadaniami',
    short_name: 'MyTasks',
    description: 'Aplikacja do zarządzania zadaniami i obszarami roboczymi z obsługą głosową.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0e1117',
    theme_color: '#2f80ed',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
