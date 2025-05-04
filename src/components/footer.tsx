import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full h-fit py-8 px-6 md:px-10 bg-gradient-to-r from-blue-400 to-blue-600 text-primary-foreground">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="col-span-1">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold">PostPilot.ai</span>
          </Link>
          <p className="mt-4 text-sm opacity-80">
            AI-powered social media post generator to boost your professional presence.
          </p>
        </div>

        <div className="col-span-1">
          <h3 className="font-medium mb-4">Connect</h3>
          <ul className="space-y-2">
            <li>
              <Link href="https://www.linkedin.com/in/koshik-mehta-9271b0258/" className="text-sm opacity-80 hover:opacity-100">
                LinkedIn - Koshik Mehta
              </Link>
            </li>
            <li>
              <Link href="https://www.linkedin.com/company/autonerve-ai/" className="text-sm opacity-80 hover:opacity-100">
                LinkedIn - AutoNerv.ai
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-white/20">
        <p className="text-sm text-center opacity-80">
          © {new Date().getFullYear()} PostPilot.ai. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
