'use client'

export default function DashboardPage() {

  const username =
    typeof window !== 'undefined'
      ? localStorage.getItem('cid_user')
      : ''

  return (
    <main className="min-h-screen bg-[#212129] text-white">

      <div className="flex">

        <aside className="
          w-260px
          min-h-screen
          bg-[#323949]
          border-r
          border-[#40445A]
          p-6
        ">

          <h1 className="text-2xl font-bold mb-10">
            CID OFFICE
          </h1>

          <nav className="space-y-3">

            <div className="
              bg-[#3D3E51]
              px-4
              py-3
              rounded-xl
              cursor-pointer
            ">
              Dashboard
            </div>

            <div className="
              hover:bg-[#3D3E51]
              px-4
              py-3
              rounded-xl
              cursor-pointer
              transition
            ">
              Cases
            </div>

            <div className="
              hover:bg-[#3D3E51]
              px-4
              py-3
              rounded-xl
              cursor-pointer
              transition
            ">
              Evidence Board
            </div>

            <div className="
              hover:bg-[#3D3E51]
              px-4
              py-3
              rounded-xl
              cursor-pointer
              transition
            ">
              Intelligence
            </div>

          </nav>

        </aside>

        <section className="flex-1 p-10">

          <div className="mb-10">

            <h2 className="text-4xl font-bold mb-2">
              Welcome Back
            </h2>

            <p className="text-[#B7B7B7]">
              Agent: {username}
            </p>

          </div>

          <div className="grid grid-cols-3 gap-6">

            <div className="
              bg-[#323949]
              border
              border-[#40445A]
              rounded-2xl
              p-6
            ">
              <p className="text-[#B7B7B7] mb-2">
                Active Cases
              </p>

              <h3 className="text-4xl font-bold">
                24
              </h3>
            </div>

            <div className="
              bg-[#323949]
              border
              border-[#40445A]
              rounded-2xl
              p-6
            ">
              <p className="text-[#B7B7B7] mb-2">
                Active Suspects
              </p>

              <h3 className="text-4xl font-bold">
                61
              </h3>
            </div>

            <div className="
              bg-[#323949]
              border
              border-[#40445A]
              rounded-2xl
              p-6
            ">
              <p className="text-[#B7B7B7] mb-2">
                Operations
              </p>

              <h3 className="text-4xl font-bold">
                12
              </h3>
            </div>

          </div>

        </section>

      </div>

    </main>
  )
}