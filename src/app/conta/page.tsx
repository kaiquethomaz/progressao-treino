import { getCurrentUser } from "@/lib/user";
import { Card, SectionTitle } from "@/components/ui";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

export const dynamic = "force-dynamic";

export default async function ContaPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Conta</h1>
        <p className="mt-1 text-muted">Seus dados e segurança.</p>
      </div>

      <Card>
        <SectionTitle>Perfil</SectionTitle>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="eyebrow">Nome</dt>
            <dd className="mt-1 font-medium">{user.name}</dd>
          </div>
          <div>
            <dt className="eyebrow">Email</dt>
            <dd className="mt-1 font-medium">{user.email}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <SectionTitle>Alterar senha</SectionTitle>
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
