import dynamic from 'next/dynamic'

const OsijekMap = dynamic(() => import('@/components/OsijekMap'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen bg-dark-300 flex items-center justify-center">
      <div className="text-cobalt-400 text-xl font-medium animate-pulse">
        Učitavam Osijek Live Map...
      </div>
    </div>
  ),
})

export default function Home() {
  return <OsijekMap />
}
