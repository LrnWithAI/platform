'use client'

import { useUserStore } from "@/stores/userStore";
import AccountForm from "./account-form";

export default function Account() {
  const user = useUserStore((state) => state.user);

  return (
    <AccountForm user={user} />
  );
}
