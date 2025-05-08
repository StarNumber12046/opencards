import { cookies } from "next/headers";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
export default async function SandboxPage() {
  async function loginAsUser(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    if (!email) return;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .execute();

    if (!user) {
      return;
    }

    (await cookies()).set("authToken", user.token);
    redirect("/app/deck");
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Developer Sandbox</h1>
      <form action={loginAsUser}>
        <input
          type="email"
          name="email"
          placeholder="User email"
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Login as User
        </button>
      </form>
    </div>
  );
}
