import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { User } from "../utils/auth";
import { LogOut, Users } from "lucide-react";
import { panelStyle, cardStyle } from "../../styles/uiStyles";

export default function DashboardCoordenacao() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (!userData) {
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(userData) as User;

    if (parsedUser.type !== "coordenacao") {
      navigate("/");
      return;
    }

    setUser(parsedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) return null;

  return (
    <div
      className="min-h-screen p-4 md:p-6 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0F1117 0%, #171923 48%, #1D1A2E 100%)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 85% 80%, rgba(124,93,250,0.14), transparent 35%), radial-gradient(circle at 20% 15%, rgba(184,175,255,0.06), transparent 30%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        <header
          className="
            flex items-center justify-between
            mb-8 p-6
            rounded-2xl
            border border-white/10
            shadow-[0_20px_60px_rgba(0,0,0,0.32)]
            backdrop-blur-[20px]
          "
          style={panelStyle}
        >
          <div className="flex items-center gap-3">
            <Users className="size-8 text-[#B8AFFF]" />

            <div>
              <h1 className="text-2xl font-semibold text-white">
                Dashboard da Coordenação
              </h1>

              <p className="text-sm text-white/60">
                Bem-vindo(a), {user.name}
              </p>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="
              flex items-center gap-2
              rounded-xl
              bg-[#ffffff08]
              hover:bg-[#ffffff12]
              border border-white/10
              text-white
            "
          >
            <LogOut className="size-4" />
            Sair
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            className="rounded-2xl border-0"
            style={cardStyle}
          >
            <CardHeader>
              <CardTitle className="text-white">
                Minhas Informações
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2 text-white/70">
              <p>
                <strong className="text-white">Nome:</strong> {user.name}
              </p>

              <p>
                <strong className="text-white">Login:</strong>{" "}
                {user.identifier}
              </p>

              <p>
                <strong className="text-white">ID:</strong> {user.id}
              </p>
            </CardContent>
          </Card>

          <Card
            className="rounded-2xl border-0"
            style={cardStyle}
          >
            <CardHeader>
              <CardTitle className="text-white">
                Gerenciar Alunos
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-white/60">
                Ferramentas de gestão de alunos aparecerão aqui.
              </p>
            </CardContent>
          </Card>

          <Card
            className="rounded-2xl border-0"
            style={cardStyle}
          >
            <CardHeader>
              <CardTitle className="text-white">
                Relatórios
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-white/60">
                Relatórios e estatísticas aparecerão aqui.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}