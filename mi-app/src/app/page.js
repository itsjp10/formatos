import Login from '@/components/Login'
import dynamic from "next/dynamic"
const LoginClient = dynamic(() => import("../components/Login"), { ssr: !!false })

export default function Home() {
  return (
    <main>
      <LoginClient />
    </main>
  );
}
