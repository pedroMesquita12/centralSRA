import { useState } from "react";
import { useNavigate } from "react-router";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

import {
  Input,
} from "../components/ui/input";

import {
  Label,
} from "../components/ui/label";

import {
  Button,
} from "../components/ui/button";

import {
  Loader2,
} from "lucide-react";

import { toast } from "sonner";

import { Toaster } from "../components/ui/sonner";

import {
  validateRM,
  validateLogin,
  validatePassword,
} from "../utils/validators";

import {
  authenticateUser,
} from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] =
    useState("alunos");

  const [cnpj, setCnpj] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [errors, setErrors] =
    useState<{
      identifier?: string;
      password?: string;
    }>({});

  const handleLogin = async (
    userType:
      | "aluno"
      | "coordenacao"
      | "empresa",

    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setErrors({});

    const formData = new FormData(
      e.currentTarget
    );

    let identifier =
      formData.get(
        "identifier"
      ) as string;

    if (userType === "empresa") {
      identifier =
        identifier.replace(
          /\D/g,
          ""
        );
    }

    const password =
      formData.get(
        "password"
      ) as string;

    let hasError = false;

    const newErrors: {
      identifier?: string;
      password?: string;
    } = {};

    if (userType === "aluno") {
      if (
        !validateRM(identifier)
      ) {
        newErrors.identifier =
          "RM deve ter exatamente 5 números";

        hasError = true;
      }
    } else if (
      userType ===
      "coordenacao"
    ) {
      if (
        !validateLogin(
          identifier
        )
      ) {
        newErrors.identifier =
          "Login deve ter entre 3 e 8 caracteres";

        hasError = true;
      }
    } else if (
      userType === "empresa"
    ) {
      const cnpjLimpo =
        identifier.replace(
          /\D/g,
          ""
        );

      if (
        cnpjLimpo.length !== 14
      ) {
        newErrors.identifier =
          "CNPJ deve ter 14 números";

        hasError = true;
      }

      if (
        password.length !== 8
      ) {
        newErrors.password =
          "Senha da empresa deve ter 8 dígitos";

        hasError = true;
      }
    }

    if (
      userType !==
        "empresa" &&
      !validatePassword(password)
    ) {
      newErrors.password =
        "Senha deve ter no mínimo 6 caracteres";

      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);

      toast.error(
        "Corrija os erros no formulário"
      );

      return;
    }

    setIsLoading(true);

    try {
      const result =
        await authenticateUser(
          userType,
          identifier,
          password
        );

      if (
        result.success &&
        result.user
      ) {
        toast.success(
          result.message
        );

        localStorage.setItem(
          "user",
          JSON.stringify(
            result.user
          )
        );

        if (
          userType ===
          "aluno"
        )
          navigate("/aluno");
        else if (
          userType ===
          "coordenacao"
        )
          navigate(
            "/coordenacao"
          );
        else
          navigate("/empresa");
      } else {
        toast.error(
          result.message
        );
      }
    } catch {
      toast.error(
        "Erro ao realizar login"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRMInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value =
      e.target.value.replace(
        /\D/g,
        ""
      );

    e.target.value =
      value.slice(0, 5);
  };

  const handleCNPJInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value =
      e.target.value.replace(
        /\D/g,
        ""
      );

    setCnpj(value);
  };

  return (
    <div
      className="
        min-h-screen
        flex items-center justify-center
        px-6
        relative overflow-hidden
      "
      style={{
        background:
          "linear-gradient(135deg, #0F1117 0%, #171923 48%, #1D1A2E 100%)",
      }}
    >
      <Toaster />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(124,93,250,0.18), transparent 40%), radial-gradient(circle at 80% 80%, rgba(184,175,255,0.08), transparent 40%)",
        }}
      />

      <div
        className="
          relative
          w-full max-w-6xl
          min-h-[620px]
          rounded-[32px]
          overflow-hidden
          border border-white/10
          shadow-[0_40px_120px_rgba(0,0,0,0.55)]
          bg-[#171923]/88
          backdrop-blur-2xl
          flex
        "
      >
        <div className="absolute top-7 left-8 flex gap-2">
          <span className="size-3 rounded-full bg-white/35" />

          <span className="size-3 rounded-full bg-white/25" />

          <span className="size-3 rounded-full bg-white/15" />
        </div>

        <div
          className="
            w-full lg:w-1/2
            flex items-center justify-center
            px-10
          "
        >
          <div className="w-full max-w-sm">
            <div className="mb-10">
              <h1
                className="
                  text-5xl font-bold
                  text-white
                  tracking-wide
                "
              >
                SRA
              </h1>

              <p
                className="
                  text-sm
                  text-[#B8AFFF]
                  mt-1 tracking-wide
                "
              >
                Seu espaço educacional.
              </p>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={
                setActiveTab
              }
            >
              <TabsList
                className="
                  grid grid-cols-3
                  gap-2
                  mb-8 p-1
                  rounded-2xl

                  bg-[#ffffff08]
                  border border-white/10

                  backdrop-blur-[18px]
                "
              >
                <TabsTrigger
                  value="alunos"
                  className="
                    text-white/65
                    hover:text-white

                    data-[state=active]:text-[#F5F3FF]
                    data-[state=active]:bg-[#7C5DFA]/22
                    data-[state=active]:border
                    data-[state=active]:border-[#B8AFFF]/10

                    rounded-xl
                    transition-all duration-300
                  "
                >
                  Aluno
                </TabsTrigger>

                <TabsTrigger
                  value="coordenacao"
                  className="
                    text-white/65
                    hover:text-white

                    data-[state=active]:text-[#F5F3FF]
                    data-[state=active]:bg-[#7C5DFA]/22
                    data-[state=active]:border
                    data-[state=active]:border-[#B8AFFF]/10

                    rounded-xl
                    transition-all duration-300
                  "
                >
                  Coord
                </TabsTrigger>

                <TabsTrigger
                  value="empresas"
                  className="
                    text-white/65
                    hover:text-white

                    data-[state=active]:text-[#F5F3FF]
                    data-[state=active]:bg-[#7C5DFA]/22
                    data-[state=active]:border
                    data-[state=active]:border-[#B8AFFF]/10

                    rounded-xl
                    transition-all duration-300
                  "
                >
                  Empresa
                </TabsTrigger>
              </TabsList>

              <TabsContent value="alunos">
                <form
                  onSubmit={(e) =>
                    handleLogin(
                      "aluno",
                      e
                    )
                  }
                  className="space-y-6"
                >
                  <div>
                    <Label className="text-white/50 mb-2 block">
                      RM
                    </Label>

                    <Input
                      name="identifier"
                      type="text"
                      maxLength={5}
                      onChange={
                        handleRMInput
                      }
                      className="
                        h-12 rounded-xl

                        bg-[#ffffff08]
                        border border-white/10

                        text-white
                        placeholder:text-white/35

                        backdrop-blur-[18px]

                        focus:border-[#B8AFFF]/20
                        focus:ring-2
                        focus:ring-[#B8AFFF]/10
                      "
                      placeholder="12345"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-white/50 mb-2 block">
                      Senha
                    </Label>

                    <Input
                      name="password"
                      type="password"
                      className="
                        h-12 rounded-xl

                        bg-[#ffffff08]
                        border border-white/10

                        text-white
                        placeholder:text-white/35

                        backdrop-blur-[18px]

                        focus:border-[#B8AFFF]/20
                        focus:ring-2
                        focus:ring-[#B8AFFF]/10
                      "
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <Button
                    className="
                      w-full h-12
                      rounded-xl

                      bg-[#7C5DFA]/18
                      hover:bg-[#7C5DFA]/24

                      border border-[#B8AFFF]/10

                      text-[#F5F3FF]

                      shadow-[0_10px_35px_rgba(0,0,0,0.22)]
                    "
                    disabled={
                      isLoading
                    }
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="coordenacao">
                <form
                  onSubmit={(e) =>
                    handleLogin(
                      "coordenacao",
                      e
                    )
                  }
                  className="space-y-6"
                >
                  <div>
                    <Label className="text-white/50 mb-2 block">
                      Login
                    </Label>

                    <Input
                      name="identifier"
                      type="text"
                      className="
                        h-12 rounded-xl

                        bg-[#ffffff08]
                        border border-white/10

                        text-white
                        placeholder:text-white/35

                        backdrop-blur-[18px]

                        focus:border-[#B8AFFF]/20
                        focus:ring-2
                        focus:ring-[#B8AFFF]/10
                      "
                      placeholder="usuario"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-white/50 mb-2 block">
                      Senha
                    </Label>

                    <Input
                      name="password"
                      type="password"
                      className="
                        h-12 rounded-xl

                        bg-[#ffffff08]
                        border border-white/10

                        text-white
                        placeholder:text-white/35

                        backdrop-blur-[18px]

                        focus:border-[#B8AFFF]/20
                        focus:ring-2
                        focus:ring-[#B8AFFF]/10
                      "
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <Button
                    className="
                      w-full h-12
                      rounded-xl

                      bg-[#7C5DFA]/18
                      hover:bg-[#7C5DFA]/24

                      border border-[#B8AFFF]/10

                      text-[#F5F3FF]

                      shadow-[0_10px_35px_rgba(0,0,0,0.22)]
                    "
                    disabled={
                      isLoading
                    }
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="empresas">
                <form
                  onSubmit={(e) =>
                    handleLogin(
                      "empresa",
                      e
                    )
                  }
                  className="space-y-6"
                >
                  <div>
                    <Label className="text-white/50 mb-2 block">
                      CNPJ
                    </Label>

                    <Input
                      name="identifier"
                      value={cnpj}
                      onChange={
                        handleCNPJInput
                      }
                      className="
                        h-12 rounded-xl

                        bg-[#ffffff08]
                        border border-white/10

                        text-white
                        placeholder:text-white/35

                        backdrop-blur-[18px]

                        focus:border-[#B8AFFF]/20
                        focus:ring-2
                        focus:ring-[#B8AFFF]/10
                      "
                      placeholder="00.000.000/0000-00"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-white/50 mb-2 block">
                      Senha
                    </Label>

                    <Input
                      name="password"
                      type="password"
                      className="
                        h-12 rounded-xl

                        bg-[#ffffff08]
                        border border-white/10

                        text-white
                        placeholder:text-white/35

                        backdrop-blur-[18px]

                        focus:border-[#B8AFFF]/20
                        focus:ring-2
                        focus:ring-[#B8AFFF]/10
                      "
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <Button
                    className="
                      w-full h-12
                      rounded-xl

                      bg-[#7C5DFA]/18
                      hover:bg-[#7C5DFA]/24

                      border border-[#B8AFFF]/10

                      text-[#F5F3FF]

                      shadow-[0_10px_35px_rgba(0,0,0,0.22)]
                    "
                    disabled={
                      isLoading
                    }
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div
          className="
            hidden lg:flex
            w-1/2
            p-4
          "
        >
          <div
            className="
              relative w-full
              rounded-[26px]
              overflow-hidden

              border border-white/10

              bg-[#11131B]

              shadow-[inset_0_0_80px_rgba(255,255,255,0.02)]
            "
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 42%, rgba(124,93,250,0.18), transparent 28%), radial-gradient(circle at 78% 70%, rgba(184,175,255,0.08), transparent 28%)",
              }}
            />

            <div
              className="
                absolute inset-0
                flex items-center justify-center
              "
            >
              <div
                className="
                  relative
                  size-72
                  rounded-full

                  border border-[#B8AFFF]/20

                  bg-white/[0.02]

                  shadow-[0_0_70px_rgba(124,93,250,0.18)]
                "
              >
                <div
                  className="
                    absolute inset-6
                    rounded-full
                    border border-white/10
                  "
                />

                <div
                  className="
                    absolute inset-14
                    rounded-full
                    border border-[#B8AFFF]/10
                  "
                />

                <div
                  className="
                    absolute left-1/2 top-1/2
                    size-4

                    -translate-x-1/2
                    -translate-y-1/2

                    rounded-full

                    bg-[#B8AFFF]

                    shadow-[0_0_25px_rgba(184,175,255,0.8)]
                  "
                />

                <div
                  className="
                    absolute left-1/2 top-1/2

                    h-24 w-1

                    origin-bottom

                    -translate-x-1/2
                    -translate-y-full

                    rounded-full
                  "
                  style={{
                    background:
                      "linear-gradient(to top, #7C5DFA, rgba(255,255,255,0.85))",
                  }}
                />

                <div
                  className="
                    absolute left-1/2 top-1/2

                    h-20 w-1

                    origin-bottom

                    -translate-x-1/2
                    -translate-y-full

                    rotate-[125deg]

                    rounded-full

                    bg-white/70
                  "
                />

                {[...Array(12)].map(
                  (
                    _,
                    index
                  ) => (
                    <span
                      key={index}
                      className="
                        absolute left-1/2 top-1/2

                        h-2 w-1

                        rounded-full

                        bg-white/40
                      "
                      style={{
                        transform: `rotate(${
                          index * 30
                        }deg) translateY(-130px)`,

                        transformOrigin:
                          "center",
                      }}
                    />
                  )
                )}
              </div>
            </div>

            <div
              className="
                absolute left-10 top-10

                rounded-2xl

                border border-white/10

                bg-[#ffffff08]

                px-5 py-4

                backdrop-blur-[18px]
              "
            >
              <p className="text-[#B8AFFF] text-sm font-semibold">
                SRA
              </p>

              <p className="text-white text-lg font-semibold">
                Controle acadêmico
              </p>

              <p className="text-white/50 text-sm">
                Horas, eventos e
                certificados
              </p>
            </div>

            <div
              className="
                absolute right-10 bottom-10
                grid gap-3
              "
            >
              <div
                className="
                  rounded-2xl

                  border border-white/10

                  bg-[#ffffff08]

                  px-5 py-3

                  backdrop-blur-[18px]
                "
              >
                <p className="text-white/50 text-xs">
                  Horas AMS
                </p>

                <p className="text-white font-semibold">
                  200h meta
                </p>
              </div>

              <div
                className="
                  rounded-2xl

                  border border-white/10

                  bg-[#ffffff08]

                  px-5 py-3

                  backdrop-blur-[18px]
                "
              >
                <p className="text-white/50 text-xs">
                  Validação
                </p>

                <p className="text-white font-semibold">
                  Certificados e
                  relatórios
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}