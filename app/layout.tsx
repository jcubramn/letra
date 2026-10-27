import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
export const metadata:Metadata={title:"Letra — Learn through songs",description:"Learn Spanish or English through songs, with quizzes and personal progress."};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body style={{margin:0}}><ClerkProvider localization={{signIn:{start:{title:"Sign in to Letra"}},signUp:{start:{title:"Create your Letra account"}}}} signInUrl="/sign-in" signUpUrl="/sign-up" signInFallbackRedirectUrl="/" signUpFallbackRedirectUrl="/">{children}</ClerkProvider></body></html>}
