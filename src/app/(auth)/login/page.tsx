import LoginForm from "@/components/auth/LoginForm";

// app/(auth)/login/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;



export default function LoginPage() {
  return (
    <main style={{ maxWidth: 420, margin: "80px auto" }}>
      <h1>Login</h1>
      <LoginForm />
    </main>
  );
}
