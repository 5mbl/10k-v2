export default function Header() {
  return (
    <header className="w-full py-2 border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <img 
            src="/hwr-logo.svg" 
            alt="HWR Logo" 
            className="h-8 w-auto"
          />
          <span className="text-lg font-semibold text-gray-800">10k Search</span>
        </div>
      </div>
    </header>
  )
}