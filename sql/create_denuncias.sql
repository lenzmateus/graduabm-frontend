-- Tabela de denúncias de questões enviadas pelos alunos
CREATE TABLE IF NOT EXISTS denuncias (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questao_id  UUID NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
  usuario_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comentario  TEXT NOT NULL CHECK (char_length(comentario) <= 1000),
  resolvida   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_denuncias_resolvida ON denuncias(resolvida);
CREATE INDEX IF NOT EXISTS idx_denuncias_questao ON denuncias(questao_id);
CREATE INDEX IF NOT EXISTS idx_denuncias_usuario ON denuncias(usuario_id);

-- RLS desabilitado (acesso via service key pelo backend)
ALTER TABLE denuncias DISABLE ROW LEVEL SECURITY;
