import AccountForm from "./account-form";
import { createClient } from "@/utils/supabase/server";

export default async function Account() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="m-4 ">
      <AccountForm user={user} />
    </div>
  );
}
