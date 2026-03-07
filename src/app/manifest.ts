import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Shinkomonji E-Learning',
    short_name: 'E-Learning',
    description: '新入職員向け動画研修プラットフォーム',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#f97316',
    icons: [
      {
        src: '/icon.jpg?v=3',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/icon.jpg?v=3',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  }
}
