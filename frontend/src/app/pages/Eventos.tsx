import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { User } from "../utils/auth";

import AlunoLayout from "../components/AlunoLayout";

import {
  panelStyle,
  cardStyle,
} from "../../styles/uiStyles";

import { Mic2 } from "lucide-react";

type Evento = {
  id_evento: number;
  id_empresa: number;
  nome_empresa?: string;

  titulo: string;

  descricao: string | null;

  tipo_evento: string | null;

  data_evento: string;

  horario: string | null;

  carga_horaria: number;

  palestrante: string | null;

  info_palestrante: string | null;
};

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

function formatarData(dataISO: string) {
  if (!dataISO) return "-";

  const data = new Date(dataISO);

  if (Number.isNaN(data.getTime()))
    return dataISO;

  return data.toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}

function formatarHorario(
  horario: string | null
) {
  if (!horario) return "-";

  return horario.slice(0, 5);
}

export default function Eventos() {
  const navigate = useNavigate();

  const [horas, setHoras] =
    useState(0);

  const [user, setUser] =
    useState<User | null>(null);

  const [eventos, setEventos] =
    useState<Evento[]>([]);

  const [inscricoes, setInscricoes] =
    useState<number[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const userData =
      localStorage.getItem("user");

    if (!userData) {
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(
      userData
    ) as User;

    if (
      parsedUser.type !== "aluno"
    ) {
      navigate("/");
      return;
    }

    setUser(parsedUser);

    fetch(
      `http://localhost:3000/aluno/horas/${parsedUser.identifier}`
    )
      .then((res) => res.json())
      .then((data) =>
        setHoras(data.horas)
      )
      .catch(() => setHoras(0));
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    async function carregarEventos() {
      try {
        setLoading(true);

        const [
          eventosResponse,
          inscricoesResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/eventos`),

          fetch(
            `${API_URL}/eventos/inscricoes/aluno/${user.id}`
          ),
        ]);

        const eventosData =
          await eventosResponse.json();

        const inscricoesData =
          await inscricoesResponse.json();

        if (!eventosResponse.ok) {
          throw new Error(
            eventosData.message ||
              "Erro ao carregar eventos"
          );
        }

        setEventos(eventosData);

        if (
          inscricoesResponse.ok
        ) {
          setInscricoes(
            inscricoesData.map(
              (item: any) =>
                item.id_evento
            )
          );
        }
      } catch (error) {
        console.error(
          "Erro ao carregar eventos:",
          error
        );

        setEventos([]);
      } finally {
        setLoading(false);
      }
    }

    carregarEventos();
  }, [user]);

  const inscreverEvento =
    async (
      idEvento: number
    ) => {
      if (!user) return;

      try {
        const response =
          await fetch(
            `${API_URL}/eventos/${idEvento}/inscrever`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                idAluno: user.id,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Erro ao realizar inscrição"
          );
        }

        setInscricoes((prev) =>
          prev.includes(idEvento)
            ? prev
            : [...prev, idEvento]
        );
      } catch (error: any) {
        alert(
          error.message ||
            "Erro ao realizar inscrição."
        );
      }
    };

  if (!user) return null;

  return (
    <AlunoLayout
      user={user}
      activePage="eventos"
      horas={horas}
    >
      <Card
        className="
          rounded-2xl
          border-0
          shadow
          mb-6
        "
        style={panelStyle}
      >
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Mic2 className="size-5 text-[#B8AFFF]" />

            Eventos disponíveis
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div
              className="
                rounded-2xl
                p-6
                text-center
                border border-white/10
                backdrop-blur-[18px]
              "
              style={cardStyle}
            >
              <p className="text-white/60">
                Carregando eventos...
              </p>
            </div>
          ) : eventos.length === 0 ? (
            <div
              className="
                rounded-2xl
                p-6
                text-center
                border border-white/10
                backdrop-blur-[18px]
              "
              style={cardStyle}
            >
              <Mic2 className="size-9 text-[#B8AFFF] mx-auto mb-3" />

              <h3 className="text-white text-lg font-semibold mb-1">
                Nenhum evento disponível
              </h3>

              <p className="text-white/60">
                Aguarde uma empresa
                publicar novos eventos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {eventos.map(
                (evento) => {
                  const inscrito =
                    inscricoes.includes(
                      evento.id_evento
                    );

                  return (
                    <div
                      key={
                        evento.id_evento
                      }
                      className="
                        rounded-2xl
                        p-4
                        w-full
                        flex flex-col lg:flex-row
                        gap-4
                        items-center
                        border border-white/10
                        backdrop-blur-[18px]
                        hover:border-[#B8AFFF]/15
                        transition-all duration-300
                      "
                      style={
                        cardStyle
                      }
                    >
                      <div
                        className="
                          w-full lg:w-[220px]
                          h-40
                          shrink-0
                          overflow-hidden
                          rounded-xl
                          bg-[#ffffff08]
                          border border-white/10
                          flex items-center justify-center
                        "
                      >
                        <div className="text-center">
                          <Mic2 className="size-11 text-[#B8AFFF] mx-auto mb-2" />

                          <p className="text-white/55 text-xs">
                            {evento.tipo_evento ||
                              "EVENTO"}
                          </p>
                        </div>
                      </div>

                      <div className="flex-1 w-full">
                        <span
                          className="
                            inline-flex
                            rounded-full
                            bg-[#7C5DFA]/14
                            border border-[#B8AFFF]/10
                            px-3 py-1
                            text-xs font-semibold
                            text-[#D6CCFF]
                            mb-2
                          "
                        >
                          {evento.tipo_evento ||
                            "EVENTO"}
                        </span>

                        <h3 className="text-white font-semibold text-xl mb-2">
                          {
                            evento.titulo
                          }
                        </h3>

                        {evento.descricao && (
                          <p className="text-white/60 text-sm mb-3 line-clamp-2">
                            {
                              evento.descricao
                            }
                          </p>
                        )}

                        <div
                          className="
                            grid grid-cols-1 md:grid-cols-2
                            gap-x-6 gap-y-1
                            text-white/75
                            text-sm
                          "
                        >
                          <p>
                            <strong className="text-white">
                              Empresa:
                            </strong>{" "}
                            {evento.nome_empresa ||
                              "Empresa parceira"}
                          </p>

                          <p>
                            <strong className="text-white">
                              Data:
                            </strong>{" "}
                            {formatarData(
                              evento.data_evento
                            )}
                          </p>

                          <p>
                            <strong className="text-white">
                              Horário:
                            </strong>{" "}
                            {formatarHorario(
                              evento.horario
                            )}
                          </p>

                          <p>
                            <strong className="text-white">
                              Duração:
                            </strong>{" "}
                            {
                              evento.carga_horaria
                            }
                            h
                          </p>

                          <p>
                            <strong className="text-white">
                              Palestrante:
                            </strong>{" "}
                            {evento.palestrante ||
                              "-"}
                          </p>

                          {evento.info_palestrante && (
                            <p className="md:col-span-2 line-clamp-1">
                              <strong className="text-white">
                                Sobre:
                              </strong>{" "}
                              {
                                evento.info_palestrante
                              }
                            </p>
                          )}
                        </div>

                        <div className="flex justify-end mt-4">
                          <button
                            onClick={() =>
                              inscreverEvento(
                                evento.id_evento
                              )
                            }
                            disabled={
                              inscrito
                            }
                            className={`
                              rounded-xl
                              py-2 px-4
                              text-sm font-semibold
                              transition-all duration-300
                              border

                              ${
                                inscrito
                                  ? "bg-emerald-500/18 border-emerald-300/10 text-emerald-200 cursor-default"
                                  : "bg-[#7C5DFA]/18 hover:bg-[#7C5DFA]/24 border-[#B8AFFF]/10 text-[#F5F3FF]"
                              }
                            `}
                          >
                            {inscrito
                              ? "Inscrito"
                              : "Inscrever-se"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </AlunoLayout>
  );
}