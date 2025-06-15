
import { UsersIcon, PlayCircleIcon, HeartIcon } from "lucide-react"
import Link from "next/link"
import Appbar from "./Appbar";
import NavigateButton from "./navigation";
import SignupButton from "./SignUpButton";
import { getServerSession } from "next-auth";
import { NEXT_AUTH_CONFIG } from "@/lib/auth";

export default async function LandingPage() {

  const session =await getServerSession(NEXT_AUTH_CONFIG);

  const userId = session?.user?.id;

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
      <Appbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-black">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Let Your Fans Choose the Beat
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
                  FanTune revolutionizes music streaming by putting the playlist in your fans&apos; hands. Create deeper connections and unforgettable live sessions.
                </p>
              </div>
              <div className="space-x-4 flex">
                <NavigateButton route={`/dashbord/${userId}`} buttonTitle="start streaming"/>
                <SignupButton />
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Why Choose FanTune?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <UsersIcon className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Fan Engagement</h3>
                <p className="text-gray-300">Boost interaction and create a community around your music.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <PlayCircleIcon className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Live Streaming</h3>
                <p className="text-gray-300">Seamless live streaming with real-time fan input.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <HeartIcon className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Personalized Experience</h3>
                <p className="text-gray-300">Create unique sessions tailored to your audience&apos;s preferences.</p>
              </div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-gray-900">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">1</div>
                <h3 className="text-xl font-bold mb-2">Set Up Your Stream</h3>
                <p className="text-gray-300">Create your account and customize your streaming preferences.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">2</div>
                <h3 className="text-xl font-bold mb-2">Invite Your Fans</h3>
                <p className="text-gray-300">Share your unique stream link with your audience.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">3</div>
                <h3 className="text-xl font-bold mb-2">Let Fans Choose</h3>
                <p className="text-gray-300">Your fans vote on songs, and the most popular choices play next.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-black">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Transform Your Streams?
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join FanTune today and start creating unforgettable music experiences with your fans.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2 justify-center">
                  <SignupButton />
                </form>
                <p className="text-xs text-gray-400">
                  By signing up, you agree to our{" "}
                  <Link className="underline underline-offset-2 hover:text-primary" href="#">
                    Terms & Conditions
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">What Creators Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-900 p-6 rounded-lg shadow-md">
                <p className="text-gray-300 mb-4">FanTune has completely changed how I interact with my audience. The engagement levels are off the charts!</p>
                <p className="font-bold">- Alex Johnson, Indie Artist</p>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg shadow-md">
                <p className="text-gray-300 mb-4">I&apos;ve never felt more connected to my fans. They love being part of the music selection process&quot;</p>
                <p className="font-bold">- Sarah Lee, DJ</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-800">
        <p className="text-xs text-gray-400">© 2023 FanTune. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:text-primary" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:text-primary" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}