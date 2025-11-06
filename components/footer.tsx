import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4">JobFinder</h3>
            <p className="text-slate-400 mb-4 max-w-md">
              Your trusted partner in finding the perfect job opportunity. Connect with top employers and advance your
              career.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">For Job Seekers</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/jobs" className="hover:text-accent transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/companies" className="hover:text-accent transition-colors">
                  Companies
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-accent transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">For Employers</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/post-job" className="hover:text-accent transition-colors">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-accent transition-colors">
                  Employer Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <p className="text-slate-400">&copy; 2025 JobFinder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
