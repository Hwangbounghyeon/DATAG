import LoginForm from "@/components/auth/loginForm";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm ">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className=" font-bold text-red-400 hover:text-indigo-500 transition-colors "
            >
              Sign up
            </Link>
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
