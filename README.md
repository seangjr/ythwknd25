# YTHWKND 2025

A Next.js-based web application for managing team registrations and hero selections for YTHWKND 2025.

## Tech Stack

- **Framework**: Next.js 15.3.1 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Animation**: Framer Motion
- **Form Handling**: React Hook Form with Zod validation
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## Features

- Team registration and management
- Hero selection system
- Real-time availability tracking
- Responsive design
- Animated UI components
- Form validation
- Team member management

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or pnpm
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd ythwknd25
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (everywhere-else)/  # Public routes
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utility functions and constants
└── types/                # TypeScript type definitions
```

## Development

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

The application is configured for deployment on Vercel. Simply connect your repository to Vercel for automatic deployments.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and confidential.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
