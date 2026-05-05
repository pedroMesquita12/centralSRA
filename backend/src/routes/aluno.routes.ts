import { Router } from "express";
import multer from "multer";
import { db } from "../db.js";
import { supabase } from "../supabase.js";
import { openai } from "../openai.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});

async function moderarFotoPerfil(file: Express.Multer.File) {
  const base64 = file.buffer.toString("base64");
  const dataUrl = `data:${file.mimetype};base64,${base64}`;

  const response = await openai.moderations.create({
    model: "omni-moderation-latest",
    input: [
      {
        type: "image_url",
        image_url: {
          url: dataUrl,
        },
      },
    ],
  });

  const result = response.results[0];

  const categorias = result.categories as any;
  const scores = result.category_scores as any;

  const bloqueado =
    result.flagged === true ||
    categorias.sexual === true ||
    categorias["sexual/minors"] === true ||
    categorias["sexual/minors"] === "true" ||
    Number(scores.sexual || 0) >= 0.15 ||
    Number(scores["sexual/minors"] || 0) >= 0.01;

  return {
    aprovado: !bloqueado,
    categorias,
    scores,
  };
}

router.post("/:idAluno/foto", upload.single("foto"), async (req, res) => {
  try {
    const { idAluno } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "Nenhuma foto enviada." });
    }

    const tiposPermitidos = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

    if (!tiposPermitidos.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: "Envie apenas imagens PNG, JPG, JPEG ou WEBP.",
      });
    }

    const moderacao = await moderarFotoPerfil(req.file);

    if (!moderacao.aprovado) {
      return res.status(400).json({
        message: "A imagem enviada não é permitida como foto de perfil.",
        categorias: moderacao.categorias,
      });
    }

    const extensao = req.file.originalname.split(".").pop() || "png";
    const caminho = `fotos-perfil/aluno-${idAluno}/foto-${Date.now()}.${extensao}`;

    const { error } = await supabase.storage
      .from("arquivos-sra")
      .upload(caminho, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (error) {
      console.error("Erro no upload:", error);
      return res.status(500).json({ message: "Erro ao enviar foto." });
    }

    const { data } = supabase.storage
      .from("arquivos-sra")
      .getPublicUrl(caminho);

    const fotoUrl = data.publicUrl;

    await db.query(
      `
      UPDATE public.aluno
      SET foto_perfil_url = $1
      WHERE id_aluno = $2
      `,
      [fotoUrl, idAluno],
    );

    return res.json({
      message: "Foto atualizada com sucesso.",
      foto_perfil_url: fotoUrl,
    });
  } catch (error) {
    console.error("Erro ao atualizar foto:", error);
    return res.status(500).json({
      message: "Erro ao atualizar foto.",
    });
  }
});

export default router;