export default function ProfilePage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-3xl px-4 pt-28 sm:pt-32 pb-12 sm:pb-16 sm:px-6 lg:px-8 w-full">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 mb-4">
          Profile
        </h1>
        <p className="text-zinc-600 font-medium">
          User profile settings will be managed here.
        </p>
      </div>
    </div>
  );
}
